with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

index = 36536
start = max(0, index - 2000)
end = min(len(js), index + 2500)

with open('scratch/click_snippet.txt', 'w', encoding='utf-8') as f_out:
    f_out.write(js[start:end])

print("Snippet successfully written to scratch/click_snippet.txt")
