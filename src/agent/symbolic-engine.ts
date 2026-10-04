export type IntentName =
  | 'consultar_memoria'
  | 'aprender_fato'
  | 'corrigir_conhecimento'
  | 'esquecer_conhecimento'
  | 'consultar_conhecimento'
  | 'diagnostico'
  | 'assunto_programacao'
  | 'criar_jogo'
  | 'alterar_projeto'
  | 'explicar_codigo'
  | 'calcular'
  | 'calendario'
  | 'comando'
  | 'conversa';

export interface Fact {
  id: string;
  subject: string;
  relation: string;
  object: string | number | boolean;
  confidence: number;
  source: 'user' | 'system' | 'import';
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeEdge {
  subject: string;
  relation: string;
  object: string;
  confidence: number;
  source: Fact['source'];
}

export interface ConversationTurn {
  role: 'user' | 'bot';
  text: string;
  intent?: IntentName;
  at: string;
}

export interface SymbolicContext {
  assunto: string;
  etapa: string;
  ultimoProblema: string;
  ultimoAssunto?: string;
  ultimaPergunta?: string;
  ultimaEntidade?: string;
  pendencia?: string;
  estados: Record<string, string | number | boolean>;
}

export interface IntentResult {
  intent: IntentName;
  confidence: number;
  entities: string[];
  features: string[];
}

export interface Rule {
  id: string;
  description: string;
  when: (engine: SymbolicEngine) => boolean;
  then: (engine: SymbolicEngine) => string | null;
}

export interface SymbolicResult {
  reply: string;
  intent: IntentResult;
  trace: string[];
  changed: boolean;
  memory: { facts: number; edges: number };
}

const STORAGE_KEY = 'bit-agent-symbolic-memory-v1';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function key(text: string): string {
  return normalize(text).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function now(): string {
  return new Date().toISOString();
}

function truthValue(text: string): boolean | null {
  const n = normalize(text);
  if (/^(nao|não|nope|negativo|nunca)$/.test(n)) return false;
  if (/^(sim|yes|isso|exato|correto)$/.test(n)) return true;
  return null;
}

function levenshtein(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let left = i;
    const next = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(prev[j] + 1, left + 1, prev[j - 1] + cost);
      next.push(value);
      left = value;
    }
    for (let j = 0; j <= b.length; j++) prev[j] = next[j];
  }
  return prev[b.length];
}

function similar(a: string, b: string): number {
  const x = normalize(a);
  const y = normalize(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const d = levenshtein(x, y);
  return Math.max(0, 1 - d / Math.max(x.length, y.length));
}

function extractQuoted(text: string): string[] {
  const values = [...text.matchAll(/[“”"]([^“”"]+)[“”"]/g)].map(m => m[1].trim());
  return values.filter(Boolean);
}

function safeArithmetic(expression: string): number | null {
  const cleaned = expression.replace(',', '.').replace(/\s+/g, '');
  if (!/^[0-9+\-*/%.()]+$/.test(cleaned) || !/[0-9]/.test(cleaned)) return null;
  const tokens = cleaned.match(/\d+(?:\.\d+)?|[+\-*/%()]/g);
  if (!tokens) return null;
  const values: number[] = [];
  const ops: string[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };
  const apply = () => {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    if (!op || a === undefined || b === undefined) throw new Error('expressão');
    if (op === '+') values.push(a + b);
    else if (op === '-') values.push(a - b);
    else if (op === '*') values.push(a * b);
    else if (op === '/') values.push(a / b);
    else values.push(a % b);
  };
  try {
    for (const token of tokens) {
      if (/^[0-9]/.test(token)) values.push(Number(token));
      else if (token === '(') ops.push(token);
      else if (token === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') apply();
        if (ops.pop() !== '(') return null;
      } else {
        while (ops.length && ops[ops.length - 1] !== '(' &&
          precedence[ops[ops.length - 1]] >= precedence[token]) apply();
        ops.push(token);
      }
    }
    while (ops.length) {
      if (ops[ops.length - 1] === '(') return null;
      apply();
    }
    return values.length === 1 && Number.isFinite(values[0]) ? values[0] : null;
  } catch {
    return null;
  }
}

export class SymbolicMemory {
  facts: Fact[] = [];
  aliases: Fact[] = [];
  turns: ConversationTurn[] = [];

  addFact(subject: string, relation: string, object: string | number | boolean, source: Fact['source'] = 'user', confidence = 1): Fact {
    const existing = this.facts.find(f =>
      normalize(f.subject) === normalize(subject) &&
      normalize(f.relation) === normalize(relation) &&
      String(f.object).toLowerCase() === String(object).toLowerCase()
    );
    if (existing) {
      existing.confidence = Math.max(existing.confidence, confidence);
      existing.updatedAt = now();
      return existing;
    }
    const fact: Fact = {
      id: crypto.randomUUID?.() ?? 'fact-' + Date.now() + '-' + Math.random().toString(16).slice(2),
      subject,
      relation,
      object,
      confidence,
      source,
      createdAt: now(),
      updatedAt: now()
    };
    this.facts.push(fact);
    return fact;
  }

  removeFacts(subject?: string, relation?: string, object?: string): number {
    const before = this.facts.length;
    this.facts = this.facts.filter(f => {
      const sameSubject = !subject || normalize(f.subject) === normalize(subject);
      const sameRelation = !relation || normalize(f.relation) === normalize(relation);
      const sameObject = !object || normalize(String(f.object)) === normalize(object);
      return !(sameSubject && sameRelation && sameObject);
    });
    return before - this.facts.length;
  }

  find(subject?: string, relation?: string): Fact[] {
    return this.facts.filter(f =>
      (!subject || similar(f.subject, subject) >= 0.72) &&
      (!relation || similar(f.relation, relation) >= 0.72)
    );
  }

  learnAlias(term: string, meaning: string): Fact {
    const fact = this.addFact(term, 'significa', meaning, 'user');
    if (!this.aliases.some(a => a.id === fact.id)) this.aliases.push(fact);
    return fact;
  }

  addTurn(turn: ConversationTurn) {
    this.turns.push(turn);
    if (this.turns.length > 20) this.turns.shift();
  }

  last(role?: 'user' | 'bot'): ConversationTurn | undefined {
    return [...this.turns].reverse().find(t => !role || t.role === role);
  }

  serialize() {
    return { facts: this.facts, aliases: this.aliases, turns: this.turns };
  }

  hydrate(data: Partial<ReturnType<SymbolicMemory['serialize']>>) {
    if (Array.isArray(data.facts)) this.facts = data.facts;
    if (Array.isArray(data.aliases)) this.aliases = data.aliases;
    if (Array.isArray(data.turns)) this.turns = data.turns;
  }
}

export class KnowledgeGraph {
  edges: KnowledgeEdge[] = [];

  upsert(edge: KnowledgeEdge) {
    const found = this.edges.find(e =>
      normalize(e.subject) === normalize(edge.subject) &&
      normalize(e.relation) === normalize(edge.relation) &&
      normalize(e.object) === normalize(edge.object)
    );
    if (found) {
      found.confidence = Math.max(found.confidence, edge.confidence);
      return found;
    }
    this.edges.push(edge);
    return edge;
  }

  fromFacts(facts: Fact[]) {
    for (const fact of facts) {
      this.upsert({
        subject: String(fact.subject),
        relation: fact.relation,
        object: String(fact.object),
        confidence: fact.confidence,
        source: fact.source
      });
    }
  }

  query(subject: string, relation?: string): KnowledgeEdge[] {
    return this.edges.filter(e =>
      similar(e.subject, subject) >= 0.7 &&
      (!relation || similar(e.relation, relation) >= 0.7)
    );
  }

  describe(subject: string): string[] {
    return this.query(subject).map(e => `${e.subject} → ${e.relation} → ${e.object}`);
  }
}

export class SymbolicEngine {
  readonly memory = new SymbolicMemory();
  readonly graph = new KnowledgeGraph();
  readonly context: SymbolicContext = {
    assunto: '',
    etapa: '',
    ultimoProblema: '',
    estados: {}
  };
  readonly rules: Rule[] = [];
  private readonly synonymGroups: Record<string, string[]> = {
    servidor: ['server', 'host', 'backend', 'servidor'],
    caiu: ['parou', 'fora', 'offline', 'indisponivel', 'travou', 'caiu'],
    programacao: ['codigo', 'codar', 'programar', 'desenvolvimento', 'desenvolver'],
    jogo: ['game', 'games', 'joguinho', 'jogo'],
    diagnostico: ['erro', 'problema', 'falha', 'bug', 'caiu', 'nao responde', 'diagnostico'],
    aprender: ['aprenda', 'ensine', 'memorize', 'guarde'],
    esquecer: ['esqueca', 'apague', 'remova', 'delete'],
    corrigir: ['corrija', 'conserte', 'ajuste'],
    projeto: ['projeto', 'codigo atual', 'meu jogo', 'aplicacao']
  };

  constructor() {
    this.registerDefaultRules();
    this.restore();
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      memory: this.memory.serialize(),
      graph: this.graph.edges,
      context: this.context
    }));
  }

  restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      this.memory.hydrate(data.memory);
      if (Array.isArray(data.graph)) this.graph.edges = data.graph;
      else this.graph.fromFacts(this.memory.facts);
      Object.assign(this.context, data.context ?? {});
    } catch {
      // Memória corrompida não impede o bot de funcionar.
    }
  }

  clearMemory() {
    this.memory.facts = [];
    this.memory.aliases = [];
    this.memory.turns = [];
    this.graph.edges = [];
    this.context.assunto = '';
    this.context.etapa = '';
    this.context.ultimoProblema = '';
    this.context.ultimaPergunta = undefined;
    this.context.ultimaEntidade = undefined;
    this.context.pendencia = undefined;
    this.context.estados = {};
    this.persist();
  }

  exportKnowledge(): string {
    return JSON.stringify({
      versao: 1,
      fatos: this.memory.facts,
      aliases: this.memory.aliases,
      grafo: this.graph.edges,
      contexto: this.context
    }, null, 2);
  }

  importKnowledge(text: string): number {
    const data = JSON.parse(text);
    let count = 0;
    if (Array.isArray(data.fatos)) {
      for (const f of data.fatos) {
        if (f?.sujeito && f?.relacao && f?.objeto !== undefined) {
          this.memory.addFact(String(f.sujeito), String(f.relacao), f.objeto, 'import', Number(f.confianca ?? 1));
          count++;
        } else if (f?.subject && f?.relation && f?.object !== undefined) {
          this.memory.addFact(String(f.subject), String(f.relation), f.object, 'import', Number(f.confidence ?? 1));
          count++;
        }
      }
    }
    if (Array.isArray(data.grafo)) {
      for (const e of data.grafo) {
        if (e?.subject && e?.relation && e?.object) {
          this.graph.upsert({ ...e, confidence: Number(e.confidence ?? 1), source: e.source ?? 'import' });
        }
      }
    }
    this.graph.fromFacts(this.memory.facts);
    Object.assign(this.context, data.contexto ?? {});
    this.persist();
    return count;
  }

  private registerDefaultRules() {
    this.rules.push(
      {
        id: 'server-offline',
        description: 'Servidor não responde',
        when: e => e.context.assunto === 'servidor' && e.context.estados['servidor.respondendo'] === false,
        then: e => {
          e.context.etapa = 'verificar_processo';
          return 'Então o problema provavelmente está antes da aplicação. Vamos verificar se o processo do servidor está rodando.';
        }
      },
      {
        id: 'process-offline',
        description: 'Processo do servidor não está rodando',
        when: e => e.context.assunto === 'servidor' && e.context.estados['servidor.processo'] === false,
        then: e => {
          e.context.etapa = 'iniciar_processo';
          return 'O processo não está rodando. O próximo passo é tentar iniciar o processo e observar o resultado.';
        }
      },
      {
        id: 'process-start-failed',
        description: 'Inicialização do processo falhou',
        when: e => e.context.assunto === 'servidor' && e.context.estados['servidor.inicioFalhou'] === true,
        then: e => {
          e.context.etapa = 'consultar_logs';
          return 'A inicialização falhou. Agora vale consultar os logs para descobrir a causa.';
        }
      }
    );
  }

  private scoreIntent(text: string, exact: RegExp[], synonyms: string[]): number {
    let score = 0;
    for (const pattern of exact) if (pattern.test(text)) score += 0.55;
    const words = text.split(/\s+/);
    for (const word of words) {
      for (const syn of synonyms) score = Math.max(score, similar(word, syn) * 0.7);
    }
    return Math.min(0.99, score);
  }

  classify(text: string): IntentResult {
    const n = normalize(text);
    const features: string[] = [];
    const entities: string[] = extractQuoted(text);

    const candidates: Array<[IntentName, number, string[]]> = [
      ['consultar_memoria', this.scoreIntent(n, [/\b(qual|quem|onde|como se chama) (e|é) meu\b/, /mostre (a )?memoria/, /o que voce sabe/], ['memoria', 'nome', 'sabe']), ['consulta']],
      ['aprender_fato', this.scoreIntent(n, [/\b(meu nome|se chama|e meu|é meu)\b/, /\b(aprenda|ensine|guarde)\b/], ['aprender', 'ensine', 'memorize']), ['aprendizado']],
      ['corrigir_conhecimento', this.scoreIntent(n, [/\b(corrija|na verdade|esta errado|está errado)\b/], ['corrigir']), ['correcao']],
      ['esquecer_conhecimento', this.scoreIntent(n, [/\b(esqueca|apague|remova|delete)\b/], ['esquecer']), ['esquecimento']],
      ['consultar_conhecimento', this.scoreIntent(n, [/\b(o que e|o que é|quem e|quem é|usa|tem|possui)\b/], ['o que é', 'usa']), ['consulta_grafo']],
      ['diagnostico', this.scoreIntent(n, [/\b(caiu|nao responde|não responde|erro|falha|bug|problema|diagnostique)\b/], ['diagnostico', 'problema', 'falha', 'caiu']), ['diagnostico']],
      ['assunto_programacao', this.scoreIntent(n, [/\b(python|javascript|typescript|programacao|programação|codigo|código)\b/], ['programacao', 'codigo']), ['programacao']],
      ['alterar_projeto', this.scoreIntent(n, [/\b(adicione|adicionar|remova|remover|mude|troque|altere|corrija)\b/], ['projeto', 'codigo', 'jogo']), ['edicao']],
      ['criar_jogo', this.scoreIntent(n, [/\b(crie|criar|faça|faca|desenvolva)\b.*\b(jogo|pong|shooter|plataforma)\b/], ['jogo']), ['criacao']],
      ['explicar_codigo', this.scoreIntent(n, [/\b(explique|explica|como funciona)\b/], ['explicar']), ['explicacao']],
      ['calcular', this.scoreIntent(n, [/\b(calcule|quanto e|quanto é)\b.*[0-9]/], ['calcule', 'quanto']), ['matematica']],
      ['calendario', this.scoreIntent(n, [/\b(hoje|amanha|amanhã|data|hora|dia da semana)\b/], ['hoje', 'data', 'hora']), ['tempo']],
      ['comando', this.scoreIntent(n, [/^\/(memoria|contexto|limpar|ajuda|conhecimento)/], ['comando']), ['comando']],
      ['conversa', 0.16, [], ['conversa']]
    ];

    candidates.sort((a, b) => b[1] - a[1]);
    const [intent, confidence, intentFeatures] = candidates[0];
    if (confidence > 0.45) features.push(...intentFeatures);
    if (/\b(servidor|server|backend|host)\b/i.test(n)) entities.push('servidor');
    if (/\b(guinho|bot|chatbot)\b/i.test(n)) entities.push('Guinho');
    if (/\b(python|javascript|typescript|bit)\b/i.test(n)) entities.push((n.match(/python|javascript|typescript|bit/i)?.[0] ?? 'linguagem'));
    return { intent, confidence: Math.round(confidence * 100) / 100, entities: [...new Set(entities)], features };
  }

  private learnFromSentence(text: string, trace: string[]): boolean {
    const n = normalize(text);

    const alias = text.match(/(?:quando eu disser|quando eu falar)\s+[“"]?([^”"]+)[”"]?,?\s*(?:estou falando de|significa|quer dizer)\s+(.+)/i);
    if (alias) {
      this.memory.learnAlias(alias[1].trim(), alias[2].trim().replace(/[.!?]$/, ''));
      this.graph.fromFacts(this.memory.facts);
      trace.push(`alias aprendido: ${alias[1].trim()} → ${alias[2].trim()}`);
      return true;
    }

    const ownName = text.match(/meu nome\s+(?:e|é)\s+(.+)/i);
    if (ownName) {
      const value = ownName[1].trim().replace(/[.!?]$/, '');
      this.memory.addFact('usuário', 'nome', value);
      this.graph.fromFacts(this.memory.facts);
      trace.push(`fato aprendido: usuário → nome → ${value}`);
      return true;
    }

    const subjectName = text.match(/(.+?)\s+(?:se chama|chama-se)\s+(.+)/i);
    if (subjectName) {
      const subject = subjectName[1].trim().replace(/^meu\s+/i, 'meu ');
      const object = subjectName[2].trim().replace(/[.!?]$/, '');
      this.memory.addFact(subject, 'nome', object);
      this.graph.fromFacts(this.memory.facts);
      trace.push(`fato aprendido: ${subject} → nome → ${object}`);
      return true;
    }

    const triple = text.match(/^\s*(?:aprenda que|ensine que|guarde que)\s+(.+?)\s+(?:e|é|usa|tem|possui|tem como|significa)\s+(.+)\s*\.?$/i);
    if (triple) {
      const relationMatch = triple[1].match(/^(.+?)\s+(e|é|usa|tem|possui)$/i);
      if (relationMatch) {
        const subject = relationMatch[1].trim();
        const relation = normalize(relationMatch[2]) === 'e' || normalize(relationMatch[2]) === 'é' ? 'é' : normalize(relationMatch[2]);
        const object = triple[2].trim();
        this.memory.addFact(subject, relation, object);
        this.graph.fromFacts(this.memory.facts);
        trace.push(`fato aprendido: ${subject} → ${relation} → ${object}`);
        return true;
      }
    }

    const naturalTriple = text.match(/^\s*([A-Za-zÀ-ÿ0-9_-]+)\s+(é|e|usa|tem|possui)\s+(.+)\s*\.?$/i);
    if (naturalTriple) {
      const relation = /^(e|é)$/i.test(naturalTriple[2]) ? 'é' : normalize(naturalTriple[2]);
      const object = naturalTriple[3].trim().replace(/[.!?]$/, '');
      this.memory.addFact(naturalTriple[1], relation, object);
      this.graph.fromFacts(this.memory.facts);
      trace.push(`fato aprendido: ${naturalTriple[1]} → ${relation} → ${object}`);
      return true;
    }

    return false;
  }

  private applyContext(text: string, trace: string[]) {
    const n = normalize(text);
    if (/\b(servidor|server|backend|host)\b/.test(n)) {
      this.context.assunto = 'servidor';
      this.context.ultimoAssunto = 'servidor';
      trace.push('contexto.assunto = servidor');
    }
    if (/\b(caiu|parou|travou|offline|nao responde|não responde)\b/.test(n)) {
      this.context.etapa = 'diagnostico';
      this.context.ultimoProblema = text;
      if (this.context.assunto === 'servidor') this.context.estados['servidor.online'] = false;
      trace.push('contexto.etapa = diagnostico');
    }

    if (this.context.ultimaPergunta) {
      const answer = truthValue(text);
      if (answer !== null) {
        if (/respondendo/.test(normalize(this.context.ultimaPergunta))) {
          this.context.estados['servidor.respondendo'] = answer;
          trace.push(`servidor.respondendo = ${answer}`);
        } else if (/processo.*rodando|processo.*ativo/.test(normalize(this.context.ultimaPergunta))) {
          this.context.estados['servidor.processo'] = answer;
          trace.push(`servidor.processo = ${answer}`);
        } else if (/iniciar|iniciou/.test(normalize(this.context.ultimaPergunta))) {
          this.context.estados['servidor.inicioFalhou'] = !answer;
          trace.push(`servidor.inicioFalhou = ${!answer}`);
        }
        this.context.pendencia = undefined;
      }
    }
  }

  private answerMemory(text: string, trace: string[]): string | null {
    const n = normalize(text);
    if (/mostre (a )?memoria|o que voce sabe|o que você sabe/.test(n)) {
      const facts = this.memory.facts.slice(-8).map(f => `• ${f.subject} → ${f.relation} → ${f.object}`);
      trace.push(`consulta: ${this.memory.facts.length} fatos`);
      return facts.length ? 'Minha memória contém:\n' + facts.join('\n') : 'Minha memória está vazia.';
    }

    if (/qual (e|é) meu nome/.test(n)) {
      const fact = this.memory.find('usuário', 'nome')[0];
      trace.push('busca: usuário → nome');
      return fact ? `Seu nome é ${fact.object}.` : 'Ainda não aprendi seu nome.';
    }

    const dog = n.match(/como se chama (meu|o) (cachorro|cão|cao)/);
    if (dog) {
      const fact = this.memory.find('meu ' + dog[2], 'nome')[0] ?? this.memory.find('meu cachorro', 'nome')[0];
      trace.push('busca: meu cachorro → nome');
      return fact ? `Seu cachorro se chama ${fact.object}.` : 'Ainda não aprendi o nome do seu cachorro.';
    }

    return null;
  }

  private answerGraph(text: string, trace: string[]): string | null {
    const n = normalize(text);
    const isWhat = /^(o que|quem) /.test(n);
    const subjectMatch = n.match(/^(?:o que|quem) (?:e|é) (?:o |a )?(.+?)[?!.]?$/);
    if (subjectMatch) {
      const subject = subjectMatch[1].trim();
      const edges = this.graph.query(subject, 'é');
      trace.push(`grafo: ${subject} → é`);
      if (edges.length) return `${edges[0].subject} é ${edges[0].object}.`;
    }

    const useMatch = n.match(/(.+?)\s+(?:usa|utiliza)\s+(?:o |a )?(.+?)[?!.]?$/);
    if (useMatch) {
      const subject = useMatch[1].replace(/^o /, '').trim();
      const object = useMatch[2].trim();
      const edges = this.graph.query(subject, 'usa').filter(e => similar(e.object, object) >= 0.68);
      trace.push(`grafo: ${subject} → usa → ${object}`);
      return edges.length ? 'Sim.' : 'Não encontrei esse relacionamento na memória.';
    }

    if (isWhat) trace.push('consulta de grafo sem correspondência direta');
    return null;
  }

  private answerCalendar(text: string): string | null {
    const n = normalize(text);
    const d = new Date();
    if (/\bhora\b/.test(n)) return `Agora são ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`;
    if (/\b(hoje|data)\b/.test(n)) return `Hoje é ${d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}.`;
    if (/dia da semana/.test(n)) return `Hoje é ${d.toLocaleDateString('pt-BR', { weekday: 'long' })}.`;
    return null;
  }

  private answerCalculator(text: string, trace: string[]): string | null {
    const match = text.match(/(?:calcule|quanto (?:e|é))\s+(.+)/i);
    if (!match) return null;
    const expression = match[1].replace(/[?=]$/, '').trim();
    const result = safeArithmetic(expression);
    trace.push(`cálculo: ${expression}`);
    return result === null ? 'Não consegui calcular essa expressão.' : `Resultado: ${result}.`;
  }

  private answerDiagnostics(text: string, trace: string[]): string | null {
    const n = normalize(text);
    if (/\bservidor\b/.test(n) && /\b(caiu|nao responde|parou|offline)\b/.test(n)) {
      this.context.assunto = 'servidor';
      this.context.etapa = 'diagnostico';
      this.context.ultimoProblema = text;
      trace.push('diagnóstico iniciado para servidor');
      this.context.ultimaPergunta = 'O servidor ainda está respondendo?';
      this.context.pendencia = 'servidor.respondendo';
      return 'Ele ainda está respondendo na porta?';
    }
    return null;
  }

  private answerCommands(text: string, trace: string[]): string | null {
    const n = normalize(text);
    if (!n.startsWith('/')) return null;
    if (n === '/memoria') return this.answerMemory('mostre a memoria', trace);
    if (n === '/contexto') return `Assunto: ${this.context.assunto || 'nenhum'} | Etapa: ${this.context.etapa || 'nenhuma'} | Problema: ${this.context.ultimoProblema || 'nenhum'}`;
    if (n === '/limpar') {
      this.clearMemory();
      return 'Memória e contexto foram limpos.';
    }
    if (n === '/conhecimento') return this.graph.edges.length ? this.graph.edges.map(e => `${e.subject} → ${e.relation} → ${e.object}`).join('\n') : 'O grafo de conhecimento está vazio.';
    if (n === '/ajuda') return 'Comandos: /memoria, /contexto, /conhecimento, /limpar. Também posso aprender fatos, responder consultas e diagnosticar problemas.';
    return 'Comando não reconhecido. Use /ajuda.';
  }

  private runRules(trace: string[]): string | null {
    for (const rule of this.rules) {
      if (rule.when(this)) {
        trace.push(`regra ativada: ${rule.id}`);
        const reply = rule.then(this);
        if (reply) return reply;
      }
    }
    return null;
  }

  handle(text: string): SymbolicResult {
    const raw = text.trim();
    if (!raw) {
      return {
        reply: 'Digite uma solicitação.',
        intent: { intent: 'conversa', confidence: 1, entities: [], features: [] },
        trace: ['entrada vazia'],
        changed: false,
        memory: { facts: this.memory.facts.length, edges: this.graph.edges.length }
      };
    }

    const trace: string[] = [];
    const intent = this.classify(raw);
    trace.push(`intenção = ${intent.intent} (${Math.round(intent.confidence * 100)}%)`);
    if (intent.entities.length) trace.push('entidades = ' + intent.entities.join(', '));

    const lastQuestionBefore = this.context.ultimaPergunta;
    this.applyContext(raw, trace);

    let reply: string | null = null;
    let changed = false;

    if (intent.intent === 'comando') reply = this.answerCommands(raw, trace);
    if (!reply && intent.intent === 'calcular') reply = this.answerCalculator(raw, trace);
    if (!reply && intent.intent === 'calendario') reply = this.answerCalendar(raw);
    if (!reply && intent.intent === 'aprender_fato') {
      changed = this.learnFromSentence(raw, trace);
      if (changed) reply = 'Certo. Associei esse conhecimento à minha memória.';
      else reply = 'Entendi a intenção de aprendizado, mas preciso de uma relação explícita. Exemplo: “Meu cachorro se chama Thor”.';
    }
    if (!reply && intent.intent === 'corrigir_conhecimento') {
      const corrected = raw.match(/(?:corrija|na verdade).+?\b(?:é|e|usa|tem)\s+(.+)/i);
      if (corrected) {
        const learned = this.learnFromSentence(raw.replace(/^(?:corrija|na verdade)\s+/i, ''), trace);
        changed = learned;
        reply = learned ? 'Conhecimento corrigido.' : 'Preciso da forma corrigida, por exemplo: “Guinho é um chatbot”.';
      }
    }
    if (!reply && intent.intent === 'esquecer_conhecimento') {
      const what = raw.replace(/^(?:esqueca|apague|remova|delete)\s+(?:que\s+)?/i, '').replace(/[.!?]$/, '');
      const quoted = extractQuoted(what)[0];
      const removed = this.memory.removeFacts(quoted ?? what);
      this.graph.fromFacts(this.memory.facts);
      changed = removed > 0;
      trace.push(`fatos removidos = ${removed}`);
      reply = removed ? 'Esqueci o conhecimento solicitado.' : 'Não encontrei esse conhecimento na memória.';
    }
    if (!reply && intent.intent === 'diagnostico') reply = this.answerDiagnostics(raw, trace);
    if (!reply && (intent.intent === 'consultar_memoria' || intent.intent === 'consultar_conhecimento')) reply = this.answerMemory(raw, trace) ?? this.answerGraph(raw, trace);
    if (!reply) reply = this.runRules(trace);
    if (!reply && intent.intent === 'alterar_projeto') {
      reply = 'Entendi uma solicitação de alteração do projeto. O agente pode transformar essa intenção em tarefas e código Bit.';
      trace.push('ação pendente: alteração de projeto');
    }
    if (!reply && intent.intent === 'criar_jogo') {
      reply = 'Entendi uma solicitação de criação de jogo. Vou transformar a intenção em um plano Bit.';
      trace.push('ação pendente: criação de jogo');
    }
    if (!reply && lastQuestionBefore && truthValue(raw) !== null) {
      reply = raw.toLowerCase().startsWith('s') ? 'Certo, registrado.' : 'Certo, registrado como negativo.';
    }
    if (!reply) reply = 'Entendi. Ainda não tenho uma regra específica para essa solicitação, mas mantive o contexto para a próxima mensagem.';

    if (intent.intent !== 'comando') this.memory.addTurn({ role: 'user', text: raw, intent: intent.intent, at: now() });
    this.memory.addTurn({ role: 'bot', text: reply, at: now() });
    if (this.context.assunto) this.context.ultimaEntidade = intent.entities[0] ?? this.context.ultimaEntidade;
    if (!this.context.pendencia && /\?\s*$/.test(reply)) this.context.ultimaPergunta = reply;
    if (this.context.pendencia && /\?\s*$/.test(reply)) this.context.ultimaPergunta = reply;
    this.graph.fromFacts(this.memory.facts);
    this.persist();

    return {
      reply,
      intent,
      trace,
      changed,
      memory: { facts: this.memory.facts.length, edges: this.graph.edges.length }
    };
  }
}

export const symbolicEngine = new SymbolicEngine();
