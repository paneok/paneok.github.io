"""Deploy the static site to Beget without corrupting Cyrillic filenames."""

import os
import sys
import tarfile

import paramiko

import deploy_to_beget as config


ARCHIVE_NAME = "site_deploy_utf8.tar.gz"
REMOTE_ROOT = config.REMOTE_PATH
EXCLUDE_DIRS = {
    ".git", ".claude", ".idea", "__pycache__", "node_modules",
    "scratch", "backend", "analysis",
}
EXCLUDE_SUFFIXES = (".pyc", ".zip", ".tar.gz", ".bak", ".log")
EXCLUDE_FILES = {
    "deploy_to_beget.py", "deploy_to_beget_utf8.py", "verify_beget_deploy.py",
    "debug_beget.py", "backup_styles.py", "check_sizes.py",
}


def should_include(path):
    normalized = path.replace("\\", "/")
    parts = normalized.split("/")
    if any(part in EXCLUDE_DIRS or part.startswith(".") for part in parts[:-1]):
        return False
    name = parts[-1]
    if name in EXCLUDE_FILES or name == ARCHIVE_NAME:
        return False
    return not name.lower().endswith(EXCLUDE_SUFFIXES)


def create_archive():
    if os.path.exists(ARCHIVE_NAME):
        os.remove(ARCHIVE_NAME)

    with tarfile.open(ARCHIVE_NAME, "w:gz", format=tarfile.PAX_FORMAT) as archive:
        for root, dirs, files in os.walk("."):
            dirs[:] = [
                directory for directory in dirs
                if directory not in EXCLUDE_DIRS and not directory.startswith(".")
            ]
            for filename in files:
                path = os.path.join(root, filename)
                relative = os.path.relpath(path, ".")
                if should_include(relative):
                    archive.add(path, arcname=relative, recursive=False)

    size = os.path.getsize(ARCHIVE_NAME)
    print(f"UTF-8 archive created: {size / 1024 / 1024:.2f} MB")
    return size


def deploy():
    total_size = create_archive()
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        config.HOST,
        port=config.PORT,
        username=config.USER,
        password=config.PASS,
        timeout=30,
    )

    remote_archive = f"{REMOTE_ROOT}/{ARCHIVE_NAME}"
    sftp = ssh.open_sftp()
    last_percent = -1

    def progress(transferred, total):
        nonlocal last_percent
        percent = int(transferred * 100 / max(total, total_size, 1))
        if percent >= last_percent + 10 or percent == 100:
            last_percent = percent
            print(f"Upload: {percent}%")
            sys.stdout.flush()

    sftp.put(ARCHIVE_NAME, remote_archive, callback=progress)
    sftp.close()

    command = (
        f"cd {REMOTE_ROOT} && "
        f"tar -xzf {ARCHIVE_NAME} && rm -f {ARCHIVE_NAME} && "
        "find . -type d -exec chmod 755 {} + && "
        "find . -type f -exec chmod 644 {} +"
    )
    _, stdout, stderr = ssh.exec_command(command)
    status = stdout.channel.recv_exit_status()
    error = stderr.read().decode("utf-8", errors="replace").strip()
    ssh.close()

    if status != 0:
        raise RuntimeError(f"Remote extraction failed ({status}): {error}")

    os.remove(ARCHIVE_NAME)
    print("UTF-8 deployment completed successfully.")


if __name__ == "__main__":
    deploy()
