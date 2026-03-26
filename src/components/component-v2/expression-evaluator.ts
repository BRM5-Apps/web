/**
 * Client-side expression evaluator for Stats Card Advanced Mode preview simulation.
 * Mirrors the Go expression_evaluator.go grammar:
 *   expr     → logic_or
 *   logic_or → logic_and ( "||" logic_and )*
 *   logic_and→ equality ( "&&" equality )*
 *   equality → comparison ( ( "==" | "!=" ) comparison )*
 *   comparison → term ( ( ">" | "<" | ">=" | "<=" ) term )*
 *   term     → factor ( ( "+" | "-" ) factor )*
 *   factor   → unary ( ( "*" | "/" | "%" ) unary )*
 *   unary    → ( "-" ) unary | primary
 *   primary  → NUMBER | STRING | IDENT | "(" expr ")"
 *
 * Supports: server_stat keys, variables, arithmetic, comparisons, logical operators.
 */

// ── Token types ────────────────────────────────────────────────────────────────

type TokenKind =
  | "NUMBER"
  | "STRING"
  | "IDENT"
  | "PLUS"
  | "MINUS"
  | "STAR"
  | "SLASH"
  | "PERCENT"
  | "GREATER"
  | "LESS"
  | "GREATER_EQ"
  | "LESS_EQ"
  | "EQ_EQ"
  | "NOT_EQ"
  | "AND"
  | "OR"
  | "LPAREN"
  | "RPAREN"
  | "EOF";

interface Token {
  kind: TokenKind;
  val: string;
}

// ── Lexer ─────────────────────────────────────────────────────────────────────

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isAlpha(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
}

function isAlphaNum(ch: string): boolean {
  return isAlpha(ch) || isDigit(ch);
}

function lex(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < input.length) {
    const ch = input[pos];

    // Skip whitespace
    if (/\s/.test(ch)) {
      pos++;
      continue;
    }

    // Single-char operators
    switch (ch) {
      case "+":
        tokens.push({ kind: "PLUS", val: "+" });
        pos++;
        continue;
      case "-":
        tokens.push({ kind: "MINUS", val: "-" });
        pos++;
        continue;
      case "*":
        tokens.push({ kind: "STAR", val: "*" });
        pos++;
        continue;
      case "/":
        tokens.push({ kind: "SLASH", val: "/" });
        pos++;
        continue;
      case "%":
        tokens.push({ kind: "PERCENT", val: "%" });
        pos++;
        continue;
      case "(":
        tokens.push({ kind: "LPAREN", val: "(" });
        pos++;
        continue;
      case ")":
        tokens.push({ kind: "RPAREN", val: ")" });
        pos++;
        continue;
      case ">":
        if (input[pos + 1] === "=") {
          tokens.push({ kind: "GREATER_EQ", val: ">=" });
          pos += 2;
        } else {
          tokens.push({ kind: "GREATER", val: ">" });
          pos++;
        }
        continue;
      case "<":
        if (input[pos + 1] === "=") {
          tokens.push({ kind: "LESS_EQ", val: "<=" });
          pos += 2;
        } else {
          tokens.push({ kind: "LESS", val: "<" });
          pos++;
        }
        continue;
    }

    // Two-char operators
    if (input.slice(pos, pos + 2) === "==") {
      tokens.push({ kind: "EQ_EQ", val: "==" });
      pos += 2;
      continue;
    }
    if (input.slice(pos, pos + 2) === "!=") {
      tokens.push({ kind: "NOT_EQ", val: "!=" });
      pos += 2;
      continue;
    }
    if (input.slice(pos, pos + 2) === "&&") {
      tokens.push({ kind: "AND", val: "&&" });
      pos += 2;
      continue;
    }
    if (input.slice(pos, pos + 2) === "||") {
      tokens.push({ kind: "OR", val: "||" });
      pos += 2;
      continue;
    }

    // String literal
    if (ch === '"' || ch === "'") {
      const quote = ch;
      pos++;
      let sb = "";
      while (pos < input.length && input[pos] !== quote) {
        if (input[pos] === "\\" && pos + 1 < input.length) {
          pos++;
          switch (input[pos]) {
            case "n":
              sb += "\n";
              break;
            case "t":
              sb += "\t";
              break;
            case "\\":
              sb += "\\";
              break;
            case '"':
              sb += '"';
              break;
            case "'":
              sb += "'";
              break;
            default:
              sb += input[pos];
          }
        } else {
          sb += input[pos];
        }
        pos++;
      }
      if (pos < input.length) pos++; // consume closing quote
      tokens.push({ kind: "STRING", val: sb });
      continue;
    }

    // Number
    if (isDigit(ch) || (ch === "." && pos + 1 < input.length && isDigit(input[pos + 1]))) {
      let sb = "";
      let hasDecimal = false;
      while (pos < input.length) {
        const c = input[pos];
        if (isDigit(c)) {
          sb += c;
          pos++;
        } else if (c === "." && !hasDecimal) {
          hasDecimal = true;
          sb += ".";
          pos++;
        } else {
          break;
        }
      }
      tokens.push({ kind: "NUMBER", val: sb });
      continue;
    }

    // Identifier
    if (isAlpha(ch)) {
      let sb = "";
      while (pos < input.length && isAlphaNum(input[pos])) {
        sb += input[pos];
        pos++;
      }
      tokens.push({ kind: "IDENT", val: sb });
      continue;
    }

    // Unknown — skip
    pos++;
  }

  tokens.push({ kind: "EOF", val: "" });
  return tokens;
}

// ── Scope ────────────────────────────────────────────────────────────────────

interface EvalScope {
  serverStats: Record<string, number>;
  variables: Record<string, number | string | boolean>;
}

function resolveScope(ident: string, scope: EvalScope): number | string | boolean {
  if (ident in scope.serverStats) {
    return scope.serverStats[ident];
  }
  if (ident in scope.variables) {
    return scope.variables[ident];
  }
  throw new Error(`unknown identifier: ${ident}`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toNumber(v: number | string | boolean): number {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  const n = parseFloat(v as string);
  return isNaN(n) ? 0 : n;
}

function toBool(v: number | string | boolean): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  return (v as string) !== "";
}

function isInt(v: number | string | boolean): boolean {
  return typeof v === "number" && Number.isInteger(v);
}

function applyArith(
  a: number | string | boolean,
  b: number | string | boolean,
  op: TokenKind
): number | string | boolean {
  const aN = toNumber(a);
  const bN = toNumber(b);
  switch (op) {
    case "PLUS":
      return aN + bN;
    case "MINUS":
      return aN - bN;
    case "STAR":
      return aN * bN;
    case "SLASH":
      return bN === 0 ? 0 : aN / bN;
    case "PERCENT":
      return bN === 0 ? 0 : Math.trunc(aN) % Math.trunc(bN);
    default:
      return 0;
  }
}

function compare(
  a: number | string | boolean,
  b: number | string | boolean,
  op: TokenKind
): boolean {
  const aN = toNumber(a);
  const bN = toNumber(b);
  switch (op) {
    case "GREATER":
      return aN > bN;
    case "LESS":
      return aN < bN;
    case "GREATER_EQ":
      return aN >= bN;
    case "LESS_EQ":
      return aN <= bN;
    default:
      return false;
  }
}

function equals(
  a: number | string | boolean,
  b: number | string | boolean
): boolean {
  const aN = toNumber(a);
  const bN = toNumber(b);
  if (typeof a === "string" && typeof b === "string") {
    return a === b;
  }
  return aN === bN;
}

// ── Parser / Evaluator ───────────────────────────────────────────────────────

class Evaluator {
  private tokens: Token[];
  private pos = 0;
  private scope: EvalScope;

  constructor(input: string, scope: EvalScope) {
    this.tokens = lex(input);
    this.scope = scope;
  }

  private peek(): Token {
    return this.tokens[this.pos] ?? { kind: "EOF", val: "" };
  }

  private consume(): Token {
    return this.tokens[this.pos++] ?? { kind: "EOF", val: "" };
  }

  eval(): number | string | boolean {
    const val = this.parseExpr();
    if (this.peek().kind !== "EOF") {
      throw new Error(`unexpected token "${this.peek().val}" after expression`);
    }
    return val;
  }

  private parseExpr(): number | string | boolean {
    return this.parseLogicOr();
  }

  private parseLogicOr(): number | string | boolean {
    let left = this.parseLogicAnd();
    while (this.peek().kind === "OR") {
      this.consume();
      const right = this.parseLogicAnd();
      left = toBool(left) || toBool(right);
    }
    return left;
  }

  private parseLogicAnd(): number | string | boolean {
    let left = this.parseEquality();
    while (this.peek().kind === "AND") {
      this.consume();
      const right = this.parseEquality();
      left = toBool(left) && toBool(right);
    }
    return left;
  }

  private parseEquality(): number | string | boolean {
    let left = this.parseComparison();
    while (true) {
      const op = this.peek().kind;
      if (op !== "EQ_EQ" && op !== "NOT_EQ") break;
      this.consume();
      const right = this.parseComparison();
      if (op === "EQ_EQ") {
        left = equals(left, right);
      } else {
        left = !equals(left, right);
      }
    }
    return left;
  }

  private parseComparison(): number | string | boolean {
    let left = this.parseTerm();
    while (true) {
      const op = this.peek().kind;
      if (
        op !== "GREATER" &&
        op !== "LESS" &&
        op !== "GREATER_EQ" &&
        op !== "LESS_EQ"
      )
        break;
      this.consume();
      const right = this.parseTerm();
      left = compare(left, right, op);
    }
    return left;
  }

  private parseTerm(): number | string | boolean {
    let left = this.parseFactor();
    while (true) {
      const op = this.peek().kind;
      if (op !== "PLUS" && op !== "MINUS") break;
      this.consume();
      const right = this.parseFactor();
      left = applyArith(left, right, op);
    }
    return left;
  }

  private parseFactor(): number | string | boolean {
    let left = this.parseUnary();
    while (true) {
      const op = this.peek().kind;
      if (op !== "STAR" && op !== "SLASH" && op !== "PERCENT") break;
      this.consume();
      const right = this.parseUnary();
      left = applyArith(left, right, op);
    }
    return left;
  }

  private parseUnary(): number | string | boolean {
    if (this.peek().kind === "MINUS") {
      this.consume();
      const val = this.parseUnary();
      const n = toNumber(val);
      return typeof val === "number" ? -n : -n;
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number | string | boolean {
    const tok = this.peek();

    if (tok.kind === "NUMBER") {
      this.consume();
      return parseFloat(tok.val);
    }

    if (tok.kind === "STRING") {
      this.consume();
      return tok.val;
    }

    if (tok.kind === "LPAREN") {
      this.consume();
      const val = this.parseExpr();
      if (this.peek().kind !== "RPAREN") {
        throw new Error("expected ')' after expression");
      }
      this.consume();
      return val;
    }

    if (tok.kind === "IDENT") {
      this.consume();
      return resolveScope(tok.val, this.scope);
    }

    throw new Error(`unexpected token "${tok.val}"`);
  }
}

/**
 * Evaluate an expression string using server stats and variables as scope.
 * Mirrors the Go EvaluateExpression function.
 */
export function evaluateExpression(
  expr: string,
  serverStats: Record<string, number>,
  variables: Record<string, number | string | boolean>
): number | string | boolean {
  if (expr.trim() === "") {
    throw new Error("empty expression");
  }
  const evaluator = new Evaluator(expr, { serverStats, variables });
  return evaluator.eval();
}
