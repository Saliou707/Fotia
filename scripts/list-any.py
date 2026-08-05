import sys

cur = ''
out = {}
for line in open(r'/tmp/fotia-lint.txt', encoding='utf-8', errors='replace'):
    line = line.rstrip('\n')
    if line.startswith('D:\\Project') and 'error' not in line:
        cur = line
    if 'no-explicit-any' in line:
        parts = line.split()
        loc = parts[0]
        out.setdefault(cur, []).append(loc)

for f, locs in sorted(out.items()):
    print(f)
    print('   ', ', '.join(locs))
print('TOTAL FILES:', len(out), 'TOTAL ANY:', sum(len(v) for v in out.values()))
