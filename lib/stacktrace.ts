export interface StackTraceRef {
  path: string;
  line: number;
}

const SOURCE_EXTENSIONS = /\.(ts|tsx|js|jsx|py|go|java|rb|rs|cs|cpp|c|php|swift|kt)$/;
const SKIP_PATHS = /node_modules|\.next|dist\/|build\/|\/usr\/|\/home\/runner/;

export function parseStackTrace(errorMessage: string): StackTraceRef[] {
  const results: StackTraceRef[] = [];
  const seen = new Set<string>();

  const patterns = [
    // JS/TS: at Object.fn (src/utils/db.ts:42:7) or at src/utils/db.ts:42:7
    /(?:at\s+(?:\S+\s+)?\(?)([^\s()]+\.[a-z]+):(\d+)(?::\d+)?\)?/g,
    // Python: File "src/utils/db.py", line 42
    /File "([^"]+)", line (\d+)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(errorMessage)) !== null) {
      const rawPath = match[1];
      const line = parseInt(match[2], 10);

      if (!SOURCE_EXTENSIONS.test(rawPath)) continue;
      if (SKIP_PATHS.test(rawPath)) continue;

      // Normalize to a relative repo path
      // Strip absolute path prefix up to known source roots
      const normalized = rawPath
        .replace(/^.*?\/(src|app|lib|pages|components|utils|api|models|hooks|services)\//, "$1/")
        .replace(/^\//, "");

      const key = `${normalized}:${line}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({ path: normalized, line });
      }
    }
  }

  return results.slice(0, 5);
}

export function extractLines(content: string, targetLine: number, context = 20): string {
  const lines = content.split("\n");
  const start = Math.max(0, targetLine - context - 1);
  const end = Math.min(lines.length, targetLine + context);
  return lines
    .slice(start, end)
    .map((l, i) => `${start + i + 1}${start + i + 1 === targetLine ? " >>>" : "    "} ${l}`)
    .join("\n");
}
