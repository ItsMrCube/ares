export function formatAssembly(code: string): string {
    const lines = code.split("\n");
    const result: string[] = [];

    for (const rawLine of lines) {
        const line = rawLine.trimEnd();

        const trimmed = line.trim();

        if (
            trimmed === "" &&
            result.length > 0 &&
            result[result.length - 1] === ""
        ) {
            continue;
        }

        if (trimmed === "") {
            result.push("");
            continue;
        }

        if (
            trimmed.startsWith("#") ||
            trimmed.startsWith("//") ||
            trimmed.startsWith("/*") ||
            trimmed.startsWith("*")
        ) {
            result.push(trimmed);
            continue;
        }

        if (trimmed.startsWith(".")) {
            result.push(normalizeInstruction(trimmed));
            continue;
        }

        const labelMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_.]*)(\s*:)(.*)$/);
        if (labelMatch) {
            const label = labelMatch[1];
            const rest = labelMatch[3].trim();

            if (result.length > 0 && result[result.length - 1] !== "") {
                result.push("");
            }
            result.push(label + ":");

            if (rest !== "") {
                if (rest.startsWith(".")) {
                    result.push(normalizeInstruction(rest));
                } else {
                    result.push("    " + normalizeInstruction(rest));
                }
            }
            continue;
        }

        result.push("    " + normalizeInstruction(trimmed));
    }

    return result.join("\n");
}

function normalizeInstruction(s: string): string {
    const { code, comment } = splitComment(s);

    const normalised = code
        .replace(/\s+/g, " ")
        .replace(/\s*,\s*/g, ", ")
        .replace(/\s*\(\s*/g, "(")
        .replace(/\s*\)\s*/g, ")")
        .trimEnd();

    return comment ? normalised + " " + comment : normalised;
}

function splitComment(s: string): { code: string; comment: string } {
    let inString = false;
    let stringChar = "";

    for (let i = 0; i < s.length; i++) {
        const c = s[i];

        if (inString) {
            if (c === "\\") {
                i++;
                continue;
            }
            if (c === stringChar) {
                inString = false;
            }
            continue;
        }

        if (c === '"' || c === "'") {
            inString = true;
            stringChar = c;
            continue;
        }

        if (c === "#") {
            return { code: s.slice(0, i).trimEnd(), comment: s.slice(i).trim() };
        }

        if (c === "/" && s[i + 1] === "/") {
            return { code: s.slice(0, i).trimEnd(), comment: s.slice(i).trim() };
        }
    }

    return { code: s, comment: "" };
}
