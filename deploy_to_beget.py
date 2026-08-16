import os
import sys
import zipfile
import paramiko

HOST = "paneokut.beget.tech"
USER = "paneokut_beget"
PASS = "&vd7nlr5!DYx"
PORT = 22
REMOTE_PATH = "holiday/public_html"
ZIP_NAME = "site_deploy.zip"

EXCLUDE_DIRS = {'.git', '.claude', 'node_modules', '.idea', '__pycache__', 'scratch', 'backend', 'analysis'}
EXCLUDE_EXTS = {'.pyc', '.zip', '.bak', '.log'}

def create_zip():
    print(f"Creating {ZIP_NAME} from website files...")
    if os.path.exists(ZIP_NAME):
        os.remove(ZIP_NAME)
        
    with zipfile.ZipFile(ZIP_NAME, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
            for file in files:
                if file == ZIP_NAME or os.path.splitext(file)[1] in EXCLUDE_EXTS:
                    continue
                if file in ['deploy_to_beget.py', 'compress_images.py', 'optimize_all_images.py', 'debug_beget.py', 'check_sizes.py']:
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, '.')
                zipf.write(file_path, arcname)
    total_mb = os.path.getsize(ZIP_NAME) / (1024*1024)
    print(f"Zip created! Size: {total_mb:.2f} MB")
    return total_mb

def progress_callback(transferred, total):
    percent = (transferred / total) * 100
    mb_transferred = transferred / (1024 * 1024)
    mb_total = total / (1024 * 1024)
    sys.stdout.write(f"\rUploading: {percent:.1f}% ({mb_transferred:.1f}/{mb_total:.1f} MB)")
    sys.stdout.flush()

def deploy():
    zip_mb = create_zip()
    print(f"\nConnecting via SSH to {HOST}:{PORT} as {USER}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASS, timeout=30)
    print("SSH Connected successfully!")
    
    sftp = ssh.open_sftp()
    remote_zip = f"{REMOTE_PATH}/{ZIP_NAME}"
    print(f"Uploading {ZIP_NAME} to {remote_zip} via SFTP...")
    sftp.put(ZIP_NAME, remote_zip, callback=progress_callback)
    sftp.close()
    print("\nUpload completed successfully!")
    
    print("Unpacking zip archive on Beget server and updating permissions...")
    commands = f"cd {REMOTE_PATH} && unzip -o {ZIP_NAME} && rm -f {ZIP_NAME} && find . -type d -exec chmod 755 {{}} + && find . -type f -exec chmod 644 {{}} +"
    stdin, stdout, stderr = ssh.exec_command(commands)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode()
    err = stderr.read().decode()
    
    print(f"Unpack status exit code: {exit_status}")
    if out:
        print("Output:", out)
    if err:
        print("Stderr:", err)
        
    ssh.close()
    
    if os.path.exists(ZIP_NAME):
        os.remove(ZIP_NAME)
        
    print("\n🎉 Website successfully deployed to Beget: holiday/public_html!")

if __name__ == '__main__':
    deploy()
