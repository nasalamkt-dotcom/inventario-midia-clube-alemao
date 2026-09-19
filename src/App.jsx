import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { loadAppState, saveAppState, supabase } from "./lib/supabase.js";

/* ---------------------------------------------------------
   DKP · Inventário de Mídia e Patrocínio — dados iniciais
   Extraídos do levantamento do Setor de Eventos (2026)
--------------------------------------------------------- */

const CATEGORIES = [
  { id: "areia", name: "Quadra de Areia", meta: "Beach Tennis / Vôlei de Praia · 20m × 11,10m", icon: "⛱️" },
  { id: "poli", name: "Quadra Poliesportiva", meta: "Basquete · Futsal · Vôlei · 29,70m × 19m", icon: "🏀" },
  { id: "tenismesa", name: "Área de Tênis de Mesa", meta: "Recreação coberta", icon: "🏓" },
  { id: "academia", name: "Academia", meta: "Musculação e Fitness", icon: "💪" },
  { id: "campo", name: "Campo Society", meta: "Gramado sintético · 27m × 46m", icon: "⚽" },
  { id: "tenis", name: "Quadra de Tênis", meta: "Saibro coberto · 18m × 36,5m", icon: "🎾" },
  { id: "piscina", name: "Piscina", meta: "Semiolímpica ao ar livre", icon: "🏊" },
  { id: "estacionamento", name: "Estacionamento", meta: "Levantamento pendente", icon: "🅿️" },
  { id: "geral", name: "Geral / Clube", meta: "Formatos que não pertencem a um espaço específico", icon: "🏛️" },
];

// Cores de fundo ilustrativas por categoria — usadas enquanto não há foto real cadastrada
const CATEGORY_TINTS = {
  areia: "#E4C79A",
  poli: "#C7501B",
  tenismesa: "#3A6B7A",
  academia: "#2B2E33",
  campo: "#2E6B3E",
  tenis: "#B0522D",
  piscina: "#1E7FA6",
  estacionamento: "#4A5568",
  geral: "#1B2A41",
};

let _id = 0;
const row = (categoria, local, tipoMidia, tamanho, status, patrocinador, valorReferencia) => {
  _id += 1;
  return {
    id: "a" + _id,
    categoria,
    local,
    tipoMidia,
    tamanho,
    status, // 'disponivel' | 'negociacao' | 'indisponivel'
    patrocinador: patrocinador || "", // cliente / marca
    responsavel: "",
    observacoes: "",
    valorReferencia: valorReferencia || "", // referência histórica (ex: naming rights do PPTX original)
    valorNumero: null, // valor comercial definitivo (número) — a estipular por item
    periodicidade: "", // 'mensal' | 'anual' | 'evento'
    prazoMinimo: "", // tempo mínimo de contrato — a estipular por item
    negociador: "", // responsável interno pela negociação/venda deste ativo
    fotoUrl: "", // foto ilustrando exatamente este ponto de mídia
  };
};

function buildInitialData() {
  const d = [];

  // 01 — Quadra de Areia
  ["1", "2", "3", "4", "5"].forEach((p) =>
    d.push(row("areia", `Tela lateral Norte — pos. ${p}`, "Banner fixo na tela", "3×1m", "disponivel"))
  );
  ["1", "2", "3"].forEach((p) =>
    d.push(row("areia", `Tela lateral Sul — pos. ${p}`, "Banner fixo na tela", "3×1m", "disponivel"))
  );
  d.push(row("areia", "Tela fundo Leste — pos. 1", "Banner fixo na tela", "3×1m", "indisponivel", "Colégio Eximius"));
  d.push(row("areia", "Tela fundo Leste — pos. 2", "Banner fixo na tela", "3×1m", "indisponivel", "Eximius (provável)"));
  d.push(row("areia", "Tela fundo Leste — pos. 3", "Banner fixo na tela", "3×1m", "disponivel"));
  d.push(row("areia", "Tela fundo Oeste", "Banner fixo na tela", "3×1m", "disponivel"));
  d.push(row("areia", "Muro dos fundos (alvenaria)", "Banner / placa fixo", "4×1,5m", "disponivel"));
  d.push(row("areia", "Posições adicionais (3) — ver planilha completa", "A confirmar", "—", "disponivel"));
  d.push(row("areia", "Naming Right — \"Quadra de Areia DKP by [Marca]\"", "Naming completo", "Placa + digital", "disponivel", "", "R$ 5.500/ano"));

  // 02 — Quadra Poliesportiva
  d.push(row("poli", "Parede lateral esq. — pos. 1 a 4", "Banner/painel fixo", "3×1m ×4", "disponivel"));
  d.push(row("poli", "Parede lateral esq. — pos. 5 a 8", "Banner/painel fixo", "3×1m ×4", "disponivel"));
  d.push(row("poli", "Parede lateral dir. — pos. 1 a 4", "Banner/painel fixo", "3×1m ×4", "disponivel"));
  d.push(row("poli", "Parede lateral dir. — pos. 5 a 8", "Banner/painel fixo", "3×1m ×4", "disponivel"));
  d.push(row("poli", "Parede fundo Norte (atrás tabela)", "Banner/painel fixo", "4×1,5m", "disponivel"));
  d.push(row("poli", "Parede fundo Norte — pos. adicional", "Banner/painel fixo", "4×1,5m", "disponivel"));
  d.push(row("poli", "Parede fundo Sul", "Banner/painel fixo", "4×1,5m", "disponivel"));
  d.push(row("poli", "Colunas — 4 unidades (wrap superior)", "Placa / wrap", "0,6×0,4m ×4", "disponivel"));
  d.push(row("poli", "Treliças / vigas do teto", "Banner suspenso", "3×0,8m ×4", "disponivel"));
  d.push(row("poli", "Grade divisória (fence) — lateral", "Lona de fence", "10×1m", "disponivel"));
  d.push(row("poli", "Piso central — logo central", "Adesivo / pintura de logo", "3×3m", "disponivel"));
  d.push(row("poli", "Placar / tabela de basquete", "Adesivo na estrutura", "1×0,4m ×2", "disponivel"));
  d.push(row("poli", "Naming Right — \"Quadra Poliesportiva DKP by [Marca]\"", "Naming completo", "Placa + digital", "disponivel", "", "R$ 10.000/ano"));

  // 03 — Área de Tênis de Mesa
  d.push(row("tenismesa", "Parede branca de fundo", "Banner/painel fixo", "5×2,5m", "disponivel"));
  d.push(row("tenismesa", "Coluna cinza central (topo)", "Placa / wrap", "0,6×0,4m", "disponivel"));
  d.push(row("tenismesa", "Teto/laje (pendente)", "Banner suspenso", "2×0,6m", "disponivel"));
  d.push(row("tenismesa", "Grade da quadra (fence)", "Lona de fence", "3×1m", "disponivel"));
  d.push(row("tenismesa", "Superfície das mesas (×2)", "Adesivo de marca", "0,4×0,2m ×2", "disponivel"));

  // 04 — Academia
  d.push(row("academia", "Parede lateral longa (sala principal)", "Adesivo vinílico / placa slim", "3×0,8m", "disponivel"));
  d.push(row("academia", "Parede de fundo (sala de pesos)", "Adesivo vinílico / placa acrílica", "2×1m", "disponivel"));
  d.push(row("academia", "Parede lateral (sala de pesos)", "Placa acrílica ou adesivo", "1,5×0,8m", "disponivel"));
  d.push(row("academia", "TV/monitor existente", "Mídia digital em loop", "Tela existente", "disponivel"));
  d.push(row("academia", "Espelhos (borda inferior)", "Adesivo de rodapé / placa", "1×0,15m ×2", "disponivel"));
  d.push(row("academia", "Porta de saída / entrada", "Adesivo em vidro ou placa", "0,6×0,3m", "disponivel"));
  d.push(row("academia", "Naming Right — \"Academia DKP by [Marca]\"", "Naming completo", "Placa + digital", "disponivel", "", "R$ 12.000/ano"));

  // 05 — Campo Society
  d.push(row("campo", "Muro fundo 46m — pos. 1", "Banner fixo", "2,5×1m", "indisponivel", "Soma"));
  d.push(row("campo", "Muro fundo 46m — pos. 2", "Banner fixo", "2,5×1m", "indisponivel", "IDT"));
  d.push(row("campo", "Muro fundo 46m — pos. 3", "Banner fixo", "2,5×1m", "indisponivel", "A confirmar"));
  d.push(row("campo", "Muro fundo 46m — pos. 4", "Banner fixo", "2,5×1m", "indisponivel", "Kipolpa"));
  d.push(row("campo", "Muro fundo 46m — pos. 5", "Banner fixo", "2,5×1m", "indisponivel", "FTLOG"));
  d.push(row("campo", "Muro fundo 46m — pos. 6", "Banner fixo", "2,5×1m", "indisponivel", "Refforma Construções"));
  d.push(row("campo", "Muro fundo 46m — pos. 7", "Banner fixo", "2,5×1m", "indisponivel", "Flora Pura"));
  d.push(row("campo", "Muro fundo 46m — pos. 8 a 14 (livres)", "Banner fixo", "2,5×1m ×7", "disponivel"));
  d.push(row("campo", "Muro lateral Leste 27m — pos. 1 a 8", "Banner fixo", "2,5×1m ×8", "disponivel"));
  d.push(row("campo", "Muro lateral Oeste 27m — pos. 1 a 8", "Banner fixo", "2,5×1m ×8", "disponivel"));
  d.push(row("campo", "Muro oposto 46m — pos. 1 a 9", "Banner fixo", "2,5×1m ×9", "disponivel"));
  d.push(row("campo", "Naming Right — \"Campo Society DKP by [Marca]\"", "Naming completo", "Placa + digital", "disponivel", "", "R$ 15.000/ano"));

  // 06 — Quadra de Tênis
  d.push(row("tenis", "Parede de fundo Norte (alvenaria cinza)", "Banner/painel fixo", "5×2m", "disponivel"));
  d.push(row("tenis", "Parede de fundo Sul (alvenaria cinza)", "Banner/painel fixo", "5×2m", "disponivel"));
  d.push(row("tenis", "Tela/gradil lateral Norte — pos. 1 a 6", "Lona de fence", "3×1m ×6", "disponivel"));
  d.push(row("tenis", "Tela/gradil lateral Norte — pos. 7 a 12", "Lona de fence", "3×1m ×6", "disponivel"));
  d.push(row("tenis", "Tela/gradil lateral Sul — pos. 1 a 6", "Lona de fence", "3×1m ×6", "disponivel"));
  d.push(row("tenis", "Tela/gradil lateral Sul — pos. 7 a 12", "Lona de fence", "3×1m ×6", "disponivel"));
  d.push(row("tenis", "Mureta lateral baixa (separação camarote)", "Adesivo/placa slim", "18×0,3m", "disponivel"));
  d.push(row("tenis", "Colunas metálicas (estrutura)", "Wrap de coluna", "0,4×0,6m ×6", "disponivel"));
  d.push(row("tenis", "Área de camarote — mesa patrocinada", "Mobiliário brandado", "Por unidade", "disponivel"));
  d.push(row("tenis", "Cadeira de árbitro (estrutura)", "Placa adesiva", "0,5×0,3m", "disponivel"));
  d.push(row("tenis", "Piso (linha de fundo)", "Adesivo vinílico", "1×1m ×2", "disponivel"));
  d.push(row("tenis", "Treliças do teto (banner suspenso)", "Banner suspenso", "3×0,8m ×4", "disponivel"));
  d.push(row("tenis", "Naming Right — \"Quadra de Tênis DKP by [Marca]\"", "Naming completo", "Placa + digital", "disponivel", "", "R$ 8.000/ano"));

  // 07 — Piscina
  d.push(row("piscina", "Muro/contenção lateral longo (lado deck)", "Banner fixo / adesivo", "25×1,2m", "disponivel"));
  d.push(row("piscina", "Muro contenção — pos. 1 a 5", "Banner fixo", "4×1m ×5", "disponivel"));
  d.push(row("piscina", "Muro contenção — pos. 6 a 10", "Banner fixo", "4×1m ×5", "disponivel"));
  d.push(row("piscina", "Parede do bloco/edificação lateral", "Painel/banner fixo", "6×2m", "disponivel"));
  d.push(row("piscina", "Colunas do pergolado (estrutura fundo)", "Placa / wrap de coluna", "0,4×0,6m ×6", "disponivel"));
  d.push(row("piscina", "Deck (plataforma de largada)", "Adesivo vinílico", "0,5×0,5m ×8", "disponivel"));
  d.push(row("piscina", "Separador de raias (boias) — topo", "Adesivo de extremidade", "0,2×0,2m ×8", "disponivel"));
  d.push(row("piscina", "Área de camarote/bar (mesas e cadeiras)", "Mobiliário brandado", "Por unidade", "disponivel"));
  d.push(row("piscina", "Piso do deck (entrada da piscina)", "Adesivo vinílico de piso", "1×1m ×4", "disponivel"));
  d.push(row("piscina", "Naming Right — \"Piscina DKP by [Marca]\"", "Naming completo", "Placa + digital", "disponivel", "", "R$ 10.000/ano"));

  // Geral / Clube — novos formatos sugeridos
  d.push(row("geral", "Totem Digital (LED) — entrada / Praça DKP", "Display digital 55\"", "—", "disponivel", "", "R$ 1.500–2.500/mês"));
  d.push(row("geral", "Wi-Fi Patrocinado — página de login", "Mídia digital", "—", "disponivel", "", "R$ 500–800/mês"));
  d.push(row("geral", "Cadeiras e Mesas Brandadas — área de convivência", "Mobiliário brandado", "—", "disponivel", "", "R$ 400–700/mês"));
  d.push(row("geral", "Adesivo no Vestiário (espelhos/bancadas)", "Adesivo de alta qualidade", "—", "disponivel", "", "R$ 300–500/mês"));
  d.push(row("geral", "Ativação em Evento (Stand)", "Cota de espaço / ponto de experiência", "—", "disponivel", "", "R$ 800–2.000/evento"));

  return d;
}

const INITIAL_DATA = buildInitialData();
const STORAGE_KEY = "dkp-inventario-ativos";

const STATUS_META = {
  disponivel: { label: "Disponível", color: "#2F7D5C", bg: "#E7F4EE" },
  negociacao: { label: "Em negociação", color: "#B8790A", bg: "#FBF0DD" },
  indisponivel: { label: "Indisponível", color: "#5B6472", bg: "#EAECEF" },
};

const PERIODICIDADE_META = {
  mensal: { label: "Mensal", suffix: "/mês" },
  anual: { label: "Anual", suffix: "/ano" },
  evento: { label: "Por evento", suffix: "/evento" },
};

// Redimensiona e comprime a imagem enviada, para caber com folga no armazenamento
function resizeImageToDataUrl(file, maxDim = 820, quality = 0.68) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Falha ao carregar a imagem"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function formatBRL(n) {
  if (n === null || n === undefined || n === "" || isNaN(n)) return "";
  return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

// Fallback: alguns itens podem ter sido preenchidos na versão anterior (texto livre)
function legacyParse(asset) {
  const text = asset.valorMedia;
  if (!text || typeof text !== "string") return { valor: null, periodicidade: "" };
  const match = text.replace(/\./g, "").match(/(\d+)/);
  const valor = match ? Number(match[1]) : null;
  let periodicidade = "";
  if (/evento/i.test(text)) periodicidade = "evento";
  else if (/ano/i.test(text)) periodicidade = "anual";
  else if (/mês|mes/i.test(text)) periodicidade = "mensal";
  return { valor, periodicidade };
}

function getValorNumero(asset) {
  if (typeof asset.valorNumero === "number") return asset.valorNumero;
  return legacyParse(asset).valor;
}

function getPeriodicidade(asset) {
  if (asset.periodicidade) return asset.periodicidade;
  return legacyParse(asset).periodicidade;
}

function formatValorDisplay(asset) {
  const valor = getValorNumero(asset);
  const periodicidade = getPeriodicidade(asset);
  if (valor === null) return asset.valorMedia || "";
  const suffix = PERIODICIDADE_META[periodicidade]?.suffix || "";
  return `${formatBRL(valor)}${suffix}`;
}

// Receita mensal recorrente equivalente (eventos avulsos não entram na recorrência)
function monthlyEquivalent(asset) {
  const valor = getValorNumero(asset);
  const periodicidade = getPeriodicidade(asset);
  if (valor === null) return 0;
  if (periodicidade === "mensal") return valor;
  if (periodicidade === "anual") return valor / 12;
  return 0;
}

/* ---------------------------------------------------------
   UI
--------------------------------------------------------- */

function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useIsMobile(breakpoint = 780) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

function Gate({ onBack }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pwd) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pwd,
    });
    setLoading(false);
    if (authError) {
      setError("E-mail ou senha incorretos.");
    }
    // Sucesso: o próprio App detecta a sessão via onAuthStateChange e libera o acesso.
  };

  return (
    <div style={styles.gateWrap}>
      <div style={styles.gateCard}>
        <img src={CREST_LOGO} alt="Deutscher Klub Pernambuco" style={styles.gateCrestImg} />
        <div style={styles.gateTitle}>Inventário de Mídia e Patrocínio</div>
        <div style={styles.gateSub}>Acesso restrito · Setor de Eventos e Experiência do Sócio</div>
        <div style={{ marginTop: 28 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Seu e-mail"
            style={styles.gateInput}
            autoFocus
          />
          <input
            type="password"
            value={pwd}
            onChange={(e) => {
              setPwd(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Sua senha"
            style={{ ...styles.gateInput, marginTop: 10 }}
          />
          {error && <div style={styles.gateError}>{error}</div>}
          <button type="button" onClick={submit} style={styles.gateButton} disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
          {onBack && (
            <button type="button" onClick={onBack} style={styles.gateBackLink}>
              ← Ver portfólio público
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div style={{ ...styles.statCard, borderColor: tone || "#E4E7EC" }}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

// Imagem com fallback automático: se a foto falhar ao carregar (link quebrado,
// arquivo muito grande para o dispositivo etc.), mostra o conteúdo alternativo
// em vez de deixar um ícone de imagem quebrada na tela.
function PhotoImg({ src, alt, style, fallback }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return fallback ?? null;
  return <img src={src} alt={alt} style={style} onError={() => setFailed(true)} />;
}

function CategoryBanner({ category, photoUrl, editing, onStartEdit, onCancelEdit, onSave }) {
  const [url, setUrl] = useState(photoUrl || "");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setUrl(photoUrl || "");
    setError("");
  }, [photoUrl, editing]);

  const tint = CATEGORY_TINTS[category.id] || "#1B2A41";
  const isDataUrl = url.startsWith("data:");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setUrl(dataUrl);
    } catch (err) {
      console.error(err);
      setError("Não foi possível processar essa imagem. Tente outro arquivo.");
    } finally {
      setProcessing(false);
      e.target.value = "";
    }
  };

  return (
    <div style={{ ...styles.banner, background: photoUrl ? "#000" : tint }}>
      {!editing && (
        <PhotoImg
          src={photoUrl}
          alt={category.name}
          style={styles.bannerImg}
          fallback={<div style={styles.bannerIcon}>{category.icon}</div>}
        />
      )}

      <div style={styles.bannerOverlay} />

      <div style={styles.bannerContent}>
        <div style={styles.bannerTitle}>{category.name}</div>
        <div style={styles.bannerMeta}>{category.meta}</div>
      </div>

      {!editing ? (
        <button style={styles.bannerEditBtn} onClick={onStartEdit}>
          {photoUrl ? "Trocar foto" : "Adicionar foto"}
        </button>
      ) : (
        <div style={styles.bannerEditBox}>
          {url && (
            <div style={styles.bannerPreviewRow}>
              <img src={url} alt="Pré-visualização" style={styles.bannerPreviewImg} />
              <div style={styles.bannerPreviewLabel}>
                {isDataUrl ? "Imagem enviada do computador" : "Imagem por link (URL)"}
              </div>
            </div>
          )}

          <div style={styles.bannerEditControls}>
            <button
              type="button"
              style={styles.bannerUploadBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
            >
              {processing ? "Otimizando imagem…" : "Enviar do computador"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <input
              style={styles.bannerEditInput}
              value={isDataUrl ? "" : url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ou cole o link (URL) de uma imagem"
            />
          </div>

          {error && <div style={styles.bannerError}>{error}</div>}

          <div style={styles.bannerEditActions}>
            <button style={styles.bannerEditCancel} onClick={onCancelEdit}>Cancelar</button>
            <button
              style={styles.bannerEditSave}
              onClick={() => onSave(url.trim())}
              disabled={processing}
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status];
  return (
    <span style={{ ...styles.badge, color: m.color, background: m.bg }}>
      <span style={{ ...styles.badgeDot, background: m.color }} />
      {m.label}
    </span>
  );
}

function EditPanel({ asset, onClose, onSave }) {
  const [status, setStatus] = useState(asset.status);
  const [patrocinador, setPatrocinador] = useState(asset.patrocinador);
  const [responsavel, setResponsavel] = useState(asset.responsavel);
  const [observacoes, setObservacoes] = useState(asset.observacoes);
  const [valorNumero, setValorNumero] = useState(getValorNumero(asset) ?? "");
  const [periodicidade, setPeriodicidade] = useState(getPeriodicidade(asset));
  const [prazoMinimo, setPrazoMinimo] = useState(asset.prazoMinimo || "");
  const [negociador, setNegociador] = useState(asset.negociador || "");
  const [fotoUrl, setFotoUrl] = useState(asset.fotoUrl || "");
  const [fotoProcessing, setFotoProcessing] = useState(false);
  const [fotoError, setFotoError] = useState("");
  const fotoInputRef = useRef(null);

  const emphasize = status === "negociacao" || status === "indisponivel";
  const statusColor = STATUS_META[status].color;
  const statusBg = STATUS_META[status].bg;
  const fotoIsDataUrl = fotoUrl.startsWith("data:");

  const handleFotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoError("");
    setFotoProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 640, 0.62);
      setFotoUrl(dataUrl);
    } catch (err) {
      console.error(err);
      setFotoError("Não foi possível processar essa imagem. Tente outro arquivo.");
    } finally {
      setFotoProcessing(false);
      e.target.value = "";
    }
  };

  const save = () => {
    onSave({
      ...asset,
      status,
      patrocinador,
      responsavel,
      observacoes,
      valorNumero: valorNumero === "" ? null : Number(valorNumero),
      periodicidade,
      prazoMinimo,
      negociador,
      fotoUrl,
    });
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.panelHeader}>
          <div>
            <div style={styles.panelEyebrow}>
              {CATEGORIES.find((c) => c.id === asset.categoria)?.name}
            </div>
            <div style={styles.panelTitle}>{asset.local}</div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div style={styles.itemPhotoBox}>
          {fotoUrl ? (
            <img src={fotoUrl} alt={asset.local} style={styles.itemPhotoPreview} />
          ) : (
            <div style={styles.itemPhotoPlaceholder}>Sem foto deste ponto ainda</div>
          )}
        </div>
        <div style={styles.itemPhotoControls}>
          <button
            type="button"
            style={styles.itemPhotoUploadBtn}
            onClick={() => fotoInputRef.current?.click()}
            disabled={fotoProcessing}
          >
            {fotoProcessing ? "Otimizando…" : fotoUrl ? "Trocar foto" : "Enviar foto deste ponto"}
          </button>
          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFotoFile}
          />
          <input
            style={styles.itemPhotoUrlInput}
            value={fotoIsDataUrl ? "" : fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            placeholder="ou cole um link (URL)"
          />
          {fotoUrl && (
            <button type="button" style={styles.itemPhotoRemoveBtn} onClick={() => setFotoUrl("")}>
              Remover
            </button>
          )}
        </div>
        {fotoError && <div style={styles.bannerError}>{fotoError}</div>}

        <div style={styles.panelMetaRow}>
          <div>
            <div style={styles.panelMetaLabel}>Tipo de mídia</div>
            <div style={styles.panelMetaValue}>{asset.tipoMidia}</div>
          </div>
          <div>
            <div style={styles.panelMetaLabel}>Tamanho</div>
            <div style={styles.panelMetaValue}>{asset.tamanho}</div>
          </div>
          {asset.valorReferencia && (
            <div>
              <div style={styles.panelMetaLabel}>Referência de valor</div>
              <div style={styles.panelMetaValue}>{asset.valorReferencia}</div>
            </div>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Status</label>
          <div style={styles.statusOptions}>
            {Object.entries(STATUS_META).map(([key, m]) => (
              <button
                key={key}
                onClick={() => setStatus(key)}
                style={{
                  ...styles.statusOption,
                  borderColor: status === key ? m.color : "#E4E7EC",
                  background: status === key ? m.bg : "#FFF",
                  color: status === key ? m.color : "#5B6472",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.fieldRow}>
          <div style={{ ...styles.field, flex: "1 1 130px" }}>
            <label style={styles.label}>Valor da mídia (R$)</label>
            <input
              type="number"
              min="0"
              style={styles.input}
              value={valorNumero}
              onChange={(e) => setValorNumero(e.target.value)}
              placeholder="Ex: 400"
            />
          </div>
          <div style={{ ...styles.field, flex: "1 1 130px" }}>
            <label style={styles.label}>Prazo mínimo de contrato</label>
            <input
              style={styles.input}
              value={prazoMinimo}
              onChange={(e) => setPrazoMinimo(e.target.value)}
              placeholder="Ex: 3 meses"
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Periodicidade do valor</label>
          <div style={styles.statusOptions}>
            {Object.entries(PERIODICIDADE_META).map(([key, m]) => (
              <button
                key={key}
                onClick={() => setPeriodicidade(key)}
                style={{
                  ...styles.statusOption,
                  borderColor: periodicidade === key ? "#F5A800" : "#E4E7EC",
                  background: periodicidade === key ? "#FBF3E7" : "#FFF",
                  color: periodicidade === key ? "#8A6A34" : "#5B6472",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {emphasize ? (
          <div style={{ ...styles.emphasisBox, borderColor: statusColor, background: statusBg }}>
            <div style={{ ...styles.emphasisTitle, color: statusColor }}>
              {status === "indisponivel" ? "Cliente contratante" : "Marca em negociação"}
            </div>
            <input
              style={{ ...styles.input, ...styles.emphasisInput, borderColor: statusColor }}
              value={patrocinador}
              onChange={(e) => setPatrocinador(e.target.value)}
              placeholder={status === "indisponivel" ? "Nome do cliente que fechou este espaço" : "Nome da marca em conversa"}
            />
            <div style={{ ...styles.emphasisTitle, color: statusColor, marginTop: 14 }}>
              Responsável pela negociação
            </div>
            <input
              style={{ ...styles.input, ...styles.emphasisInput, borderColor: statusColor }}
              value={negociador}
              onChange={(e) => setNegociador(e.target.value)}
              placeholder="Quem da equipe está conduzindo"
            />
          </div>
        ) : (
          <div style={styles.field}>
            <label style={styles.label}>Marca / Patrocinador</label>
            <input
              style={styles.input}
              value={patrocinador}
              onChange={(e) => setPatrocinador(e.target.value)}
              placeholder="Nome da marca (se houver)"
            />
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Responsável interno</label>
          <input
            style={styles.input}
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Quem está cuidando deste ativo"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Observações</label>
          <textarea
            style={styles.textarea}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Contrato, prazo, condições, pendências..."
            rows={4}
          />
        </div>

        <div style={styles.panelFooter}>
          <button style={styles.secondaryBtn} onClick={onClose}>Cancelar</button>
          <button style={styles.primaryBtn} onClick={save}>Salvar alterações</button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_PHOTOS = CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: "" }), {});
const EMPTY_SELLER_NOTES = CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: "" }), {});
// Ponto de partida sugerido, conforme exemplo dado pela equipe.
EMPTY_SELLER_NOTES.piscina = "Movimento Moda Praia\nRush Moda Praia";

// Termo de busca sugerido por categoria, para o link "Ver no Google Maps" do portal de vendedores.
const SELLER_SEARCH_TERMS = {
  areia: "moda praia protetor solar",
  poli: "material esportivo multiesporte",
  tenismesa: "artigos esportivos",
  academia: "suplementos alimentares academia",
  campo: "material esportivo futebol bebidas isotônicas",
  tenis: "artigos de tênis roupas esportivas",
  piscina: "moda praia protetor solar escola de natação",
  estacionamento: "concessionária de veículos seguradora automóveis",
  geral: "marcas patrocinadoras de eventos",
};

function mapsSearchLink(term) {
  const query = `${term} perto do Clube Alemão de Pernambuco, Recife`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function Dashboard({ assets, onBack, isMobile }) {
  const kpis = useMemo(() => {
    let potentialMonthly = 0;
    let currentMonthly = 0;
    let pipelineMonthly = 0;
    let unpriced = 0;
    let eventoPotential = 0;
    let eventoSold = 0;

    assets.forEach((a) => {
      const valor = getValorNumero(a);
      const periodicidade = getPeriodicidade(a);
      if (valor === null) {
        unpriced += 1;
        return;
      }
      const monthly = monthlyEquivalent(a);
      potentialMonthly += monthly;
      if (a.status === "indisponivel") currentMonthly += monthly;
      if (a.status === "negociacao") pipelineMonthly += monthly;
      if (periodicidade === "evento") {
        eventoPotential += valor;
        if (a.status === "indisponivel") eventoSold += valor;
      }
    });

    const captureRate = potentialMonthly > 0 ? (currentMonthly / potentialMonthly) * 100 : 0;
    return { potentialMonthly, currentMonthly, pipelineMonthly, unpriced, eventoPotential, eventoSold, captureRate };
  }, [assets]);

  const byCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((c) => {
      map[c.id] = { ...c, total: 0, vendidos: 0, negociacao: 0, disponivel: 0, currentMonthly: 0, potentialMonthly: 0 };
    });
    assets.forEach((a) => {
      const bucket = map[a.categoria];
      if (!bucket) return;
      bucket.total += 1;
      if (a.status === "disponivel") bucket.disponivel += 1;
      else if (a.status === "negociacao") bucket.negociacao += 1;
      else bucket.vendidos += 1;
      const monthly = monthlyEquivalent(a);
      bucket.potentialMonthly += monthly;
      if (a.status === "indisponivel") bucket.currentMonthly += monthly;
    });
    return Object.values(map)
      .filter((c) => c.total > 0)
      .sort((x, y) => (y.potentialMonthly - y.currentMonthly) - (x.potentialMonthly - x.currentMonthly));
  }, [assets]);

  const namingRights = useMemo(() => assets.filter((a) => a.tipoMidia === "Naming completo"), [assets]);

  return (
    <div style={{ ...styles.dashWrap, ...(isMobile ? styles.dashWrapMobile : {}) }}>
      <div style={styles.dashHeaderRow}>
        <div>
          <div style={styles.dashTitle}>Dashboard financeiro</div>
          <div style={styles.dashSub}>Visão consolidada de receita e ocupação comercial</div>
        </div>
        <button style={styles.secondaryBtn} onClick={onBack}>← Voltar ao inventário</button>
      </div>

      <div style={styles.dashKpiGrid}>
        <div style={styles.dashKpiCard}>
          <div style={styles.dashKpiLabel}>Receita recorrente atual (mês)</div>
          <div style={styles.dashKpiValue}>{formatBRL(kpis.currentMonthly) || "R$ 0"}</div>
          <div style={styles.dashKpiNote}>Ativos já vendidos (Indisponível), equivalente mensal</div>
        </div>
        <div style={styles.dashKpiCard}>
          <div style={styles.dashKpiLabel}>Receita potencial máxima (mês)</div>
          <div style={styles.dashKpiValue}>{formatBRL(kpis.potentialMonthly) || "R$ 0"}</div>
          <div style={styles.dashKpiNote}>Se todo o inventário precificado fosse vendido</div>
        </div>
        <div style={styles.dashKpiCard}>
          <div style={styles.dashKpiLabel}>Taxa de captura</div>
          <div style={styles.dashKpiValue}>{kpis.captureRate.toFixed(0)}%</div>
          <div style={styles.dashKpiNote}>Receita atual sobre o potencial máximo</div>
        </div>
        <div style={styles.dashKpiCard}>
          <div style={styles.dashKpiLabel}>Em negociação (pipeline)</div>
          <div style={styles.dashKpiValue}>{formatBRL(kpis.pipelineMonthly) || "R$ 0"}</div>
          <div style={styles.dashKpiNote}>Receita mensal das negociações em andamento</div>
        </div>
      </div>

      {kpis.eventoPotential > 0 && (
        <div style={styles.dashKpiGrid}>
          <div style={styles.dashKpiCard}>
            <div style={styles.dashKpiLabel}>Receita pontual já vendida em eventos</div>
            <div style={styles.dashKpiValue}>{formatBRL(kpis.eventoSold) || "R$ 0"}</div>
          </div>
          <div style={styles.dashKpiCard}>
            <div style={styles.dashKpiLabel}>Potencial pontual em eventos</div>
            <div style={styles.dashKpiValue}>{formatBRL(kpis.eventoPotential) || "R$ 0"}</div>
          </div>
        </div>
      )}

      {kpis.unpriced > 0 && (
        <div style={styles.dashAlert}>
          {kpis.unpriced} {kpis.unpriced === 1 ? "ativo ainda não tem" : "ativos ainda não têm"} valor definido — os
          números acima consideram apenas os itens já precificados.
        </div>
      )}

      <div style={styles.dashSectionTitle}>Ocupação e receita por espaço</div>
      <div style={styles.dashTableWrap}>
        <table style={styles.dashTable}>
          <thead>
            <tr>
              <th style={styles.dashTh}>Espaço</th>
              <th style={styles.dashTh}>Vendidos</th>
              <th style={styles.dashTh}>Negociação</th>
              <th style={styles.dashTh}>Disponíveis</th>
              <th style={styles.dashTh}>Ocupação</th>
              <th style={styles.dashTh}>Receita atual/mês</th>
              <th style={styles.dashTh}>Potencial/mês</th>
            </tr>
          </thead>
          <tbody>
            {byCategory.map((c) => {
              const occ = c.total > 0 ? ((c.vendidos + c.negociacao) / c.total) * 100 : 0;
              return (
                <tr key={c.id}>
                  <td style={styles.dashTd}>
                    <span style={{ marginRight: 6 }}>{c.icon}</span>
                    {c.name}
                  </td>
                  <td style={styles.dashTd}>{c.vendidos}</td>
                  <td style={styles.dashTd}>{c.negociacao}</td>
                  <td style={styles.dashTd}>{c.disponivel}</td>
                  <td style={styles.dashTd}>{occ.toFixed(0)}%</td>
                  <td style={styles.dashTd}>{formatBRL(c.currentMonthly) || "—"}</td>
                  <td style={styles.dashTd}>{formatBRL(c.potentialMonthly) || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.dashSectionTitle}>Naming rights — status por espaço</div>
      <div style={styles.namingGrid}>
        {namingRights.map((n) => {
          const m = STATUS_META[n.status];
          const cat = CATEGORIES.find((c) => c.id === n.categoria);
          return (
            <div key={n.id} style={styles.namingCard}>
              <div style={styles.namingCategory}>
                {cat?.icon} {cat?.name}
              </div>
              <div style={{ ...styles.namingStatus, color: m.color }}>{m.label}</div>
              {n.status === "indisponivel" && n.patrocinador && (
                <div style={styles.namingClient}>{n.patrocinador}</div>
              )}
              {formatValorDisplay(n) && <div style={styles.namingValue}>{formatValorDisplay(n)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CREST_LOGO = "data:image/png;base64,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qtUq1lrmzp3Li1/8YpRS3Hfffdx8880cOXKEM888k5NPPpmHH36YK6+8kkKhwMTEBNdffz133HEHxhjWrFnDZZddxty5c2k0Gm3AHg/o4/P6rc/uRGxmOOEqsVq+8PF+0lOV4DnnJE1Tef/73y/FYrHto5188skyf/58KZVKctVVV8nXv/51WblypSilRGstK1askAsvvFBGRkYEkLVr18pHPvIRGRoaapcNnnzyybJ06VIplUqydOlSue666+TOO++UVatWtcsGzzjjDDl48KC8613vapdxDg8Py3e/+10RETl8+LCcfPLJAsiZZ54po6OjIiJy0003ycqVK9u+a19fn6xbt05ERG655Rbp6upqlyWefvrpcskll7TLO0ulkqxevVoqlYpUKhV51ateJT/+8Y/lzDPPbJdILlq0SF73utfJhRde2C7XvPrqq2ViYkI+9KEPSaVSka6uLjnrrLNkZGREKpWKnHXWWeKck3Xr1snzn/98iaJIFi9eLMuXLxdjjCxfvly+/e1vi3OuXar5ZJ9T6/XW53kiygkJ4NaH/mRllseLtVZqtZpMT0/Lu9/97nbd8IEDB+SWW26RwcFBAeRjH/uY3HbbbdLZ2SkDAwOyceNGWbdunfzbv/2bXHrppbJs2TKZnp6Wv//7v2+Xa27fvl127twpL3zhCwWQl73sZZIkidx4443S09MjYRhKEATyd3/3d5KmqXz0ox+VKIrky1/+slSrVRER+da3viVhGIrWWjo6OuSmm25qA+Dmm2+WYrHY/vtf/MVfiIjIH//xH7fBOzg4KJs2bZKpqSn59V//dQHkoosuksnJSfnIRz4iQRCI1loeeughueOOO6Srq0u6urrkxhtvlJmZGdm5c6f09/fLJZdcItPT0/LFL35RjDHS398v3//+92VsbEweeOABWbZsmZx77rly8ODBNuivvvpq2bFjhxw6dEje+c53CiALFy6URx99tB2Qam22TxWYOlGCVsfLCcvI8USm1lP5T60ywL6+Prz3FAqFtunb8k0nJyfp7+9vd90kScJHPvIRvvOd7/CmN72pHUzq6Og4xj8sFAoUCgW01px00kmEYdgOfp1++umUSiU+/vGPs2vXLvr7+xERenp62sGtG2+8kYULF3LxxRczPT3N9ddf3zbze3t7UUrR29uL1pprrrmGxx57jO9///ucdtppdHZ2EoYhIyMjVCoVzjrrrHYu1hjDnDlzEJH234vFYjufPDw8TKlUYmBggO7u7nZg63Of+xzOOV74whfyohe9iK6uLtasWcPv/M7vUCgUuOGGG7j99tsZGBjgj/7ojxgZGaG/v5+3vvWtLF68mF27dvHNb37zcY36T2Uen4jN/CdkHvg/9JBmVWO1KpA2bNjA+eefz6WXXsquXbs4+eSTednLXsb09DRBEDA5OclVV13FV77yFZIk4RWveAXf+MY32j54EARs3bqVF7zgBZx55pl897vf5SUveQnvfe9724GtNE35b//tv3HZZZexdetWPvrRj7b9wlbQZmxsjGuvvZbLLruM173udQBcf/31TE9Pt69Xa83LX/5yBgcH2bRpE5/4xCfYs2cPV199dbt9rwWASqWC1pr169dz5pln8sY3vhFjDG9+85tZvHgxaZq2r78VqfbeU6vVSNOUWq3GoUOHAFi4cGG7Wstay2tf+1o+8YlPcN999wFZPXOrHjpJEgYHB1mwYAHee+65556nZOLIJQfwzxSFbQGm1YTe19fH1VdfzR/8wR/w//1//x/f/va3Oe2009r/WygUeO1rX8vq1atJkoRt27bxuc99rl0A0TrHG9/4Rn7t136NcrnM7t272/XALWsgiiLe/va3UyqV+MIXvsCXvvSlY2hyfvKTn7B582buuusu/vmf/5kwDFm/fj3r1q1rX3uj0WBkZISzzjoLay2f/vSn6e/v55xzzqHRaNDR0dG+v1YBycDAAG95y1v4vd/7PYrFIp/73Oe466672tHy2U30SZK0rzsIgna0ulVr3grk7d27lw0bNrTvrVarUa/X29p+enqaarXa1vA5aHMA/3wAzCwuqOb3oaEh3vWud/H2t7+dV7/61SxZsgQRaWu0KIp4xzvewZvf/GbOPvtsvvKVr/CZz3ym3divlGLOnDm8+93v5k/+5E8YHBxk165d3HzzzXz/+99vp2GCIOCiiy7iyiuvZHx8nGuvvbZtBQB8/etfZ86cObzzne/kXe96F8973vOoVqt89atfBSCKItI0Zc6cOe2uoJmZGc4//3wWLVrUBm5Ls4+NjeGcY/78+fzu7/4uH/jABzjllFPYvHkz3/jGN+jt7aVSqTAxMcHu3bvb75E1JYSUy2WWLVsGwMaNG9tsIkopvvjFL/K+972Pc845B601+/fv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";

const WHATSAPP_NUMBER = "5581998612000";

function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

const PUBLIC_STATUS_META = {
  disponivel: { label: "Disponível", color: "#2F7D5C", bg: "#E7F4EE" },
  negociacao: { label: "Em negociação", color: "#B8790A", bg: "#FBF0DD" },
  indisponivel: { label: "Indisponível", color: "#C4232C", bg: "#FBE7E8" },
};

function PublicShowcase({ assets, categoryPhotos, loading, dbError, onTeamAccess, onSellerAccess }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const stats = useMemo(() => {
    const total = assets.length;
    const disponiveis = assets.filter((a) => a.status === "disponivel").length;
    const marcas = new Set(
      assets.filter((a) => a.status === "indisponivel" && a.patrocinador).map((a) => a.patrocinador.trim())
    );
    return { total, disponiveis, marcas: Array.from(marcas).filter(Boolean) };
  }, [assets]);

  const byCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((c) => (map[c.id] = []));
    assets.forEach((a) => {
      if (map[a.categoria]) map[a.categoria].push(a);
    });
    return map;
  }, [assets]);

  return (
    <div style={styles.pubApp}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Manrope', -apple-system, sans-serif; }
        a { text-decoration: none; }
        html { scroll-behavior: smooth; }
      `}</style>

      <div style={styles.pubUtilityBar}>
        <div style={styles.pubUtilityLeft}>
          <img src={CREST_LOGO} alt="Deutscher Klub Pernambuco" style={styles.pubUtilityCrest} />
          <span style={styles.pubUtilityName}>Clube Alemão de Pernambuco</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            style={{ ...styles.pubTeamLink, background: "transparent", border: "1px solid rgba(255,255,255,0.4)", color: "#FFFFFF" }}
            onClick={onSellerAccess}
          >
            Acesso do vendedor
          </button>
          <button style={styles.pubTeamLink} onClick={onTeamAccess}>
            Acesso da equipe
          </button>
        </div>
      </div>

      {dbError && (
        <div style={styles.dbErrorBanner}>
          Não foi possível conectar ao banco de dados agora — os dados exibidos podem estar
          desatualizados. Avise a equipe técnica.
        </div>
      )}

      <section style={styles.pubHero}>
        <div style={styles.pubHeroShapeRed} />
        <div style={styles.pubHeroShapeGold} />
        <div style={styles.pubHeroOverlay} />
        <div style={styles.pubHeroContent}>
          <img src={CREST_LOGO} alt="Deutscher Klub Pernambuco" style={styles.pubHeroCrestImg} />
          <div style={styles.pubHeroEyebrow}>Portfólio de Mídia e Patrocínio · 2026</div>
          <h1 style={styles.pubHeroTitle}>Sua marca dentro do Clube Alemão de Pernambuco</h1>
          <p style={styles.pubHeroSub}>
            Espaços físicos, naming rights e formatos digitais para conectar sua marca a um público
            qualificado, em um ambiente de convivência e experiência únicos.
          </p>
          <div style={styles.pubHeroCtas}>
            <a
              href={waLink("Olá! Vi o portfólio de mídia do Clube Alemão e gostaria de saber mais sobre os espaços disponíveis.")}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.pubCtaPrimary}
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section style={styles.pubStatsBar}>
        <div style={styles.pubStatItem}>
          <div style={styles.pubStatValue}>{loading ? "—" : stats.total}</div>
          <div style={styles.pubStatLabel}>Espaços de mídia mapeados</div>
        </div>
        <div style={styles.pubStatDivider} />
        <div style={styles.pubStatItem}>
          <div style={{ ...styles.pubStatValue, color: "#2F7D5C" }}>{loading ? "—" : stats.disponiveis}</div>
          <div style={styles.pubStatLabel}>Disponíveis agora</div>
        </div>
        <div style={styles.pubStatDivider} />
        <div style={styles.pubStatItem}>
          <div style={{ ...styles.pubStatValue, color: "#F5A800" }}>{loading ? "—" : stats.marcas.length}</div>
          <div style={styles.pubStatLabel}>Marcas parceiras</div>
        </div>
      </section>

      {!loading && (
        <nav style={styles.pubQuickNav}>
          <button
            style={{
              ...styles.pubQuickNavItem,
              ...(activeCategory === "all" ? styles.pubQuickNavItemActive : {}),
            }}
            onClick={() => setActiveCategory("all")}
          >
            Todos os espaços
          </button>
          {CATEGORIES.filter((c) => byCategory[c.id]?.length > 0).map((c) => (
            <button
              key={c.id}
              style={{
                ...styles.pubQuickNavItem,
                ...(activeCategory === c.id ? styles.pubQuickNavItemActive : {}),
              }}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </nav>
      )}

      <main style={styles.pubMain}>
        {loading && <div style={styles.pubLoadingState}>Carregando portfólio…</div>}

        {!loading &&
          CATEGORIES.filter((c) => byCategory[c.id]?.length > 0)
            .filter((c) => activeCategory === "all" || activeCategory === c.id)
            .map((c) => {
            const items = byCategory[c.id];
            const photo = categoryPhotos[c.id];
            const tint = CATEGORY_TINTS[c.id] || "#1B2A41";
            const totalMapeado = items.length;
            const totalDisponivel = items.filter((i) => i.status === "disponivel").length;
            return (
              <section key={c.id} id={`cat-${c.id}`} style={styles.pubCategorySection}>
                <div style={{ ...styles.pubCategoryBanner, background: photo ? "#000" : tint }}>
                  <PhotoImg
                    src={photo}
                    alt={c.name}
                    style={styles.pubCategoryBannerImg}
                    fallback={<div style={styles.pubCategoryBannerIcon}>{c.icon}</div>}
                  />
                  <div style={styles.pubCategoryBannerOverlay} />
                  <div style={styles.pubCategoryBannerContent}>
                    <div style={styles.pubCategoryBannerAccent} />
                    <div style={styles.pubCategoryBannerTitle}>{c.name}</div>
                    <div style={styles.pubCategoryBannerMeta}>{c.meta}</div>
                  </div>
                </div>

                <div style={styles.pubCategoryStatsCard}>
                  <div style={styles.pubStatItem}>
                    <div style={styles.pubStatValue}>{totalMapeado}</div>
                    <div style={styles.pubStatLabel}>{totalMapeado === 1 ? "Espaço de mídia mapeado" : "Espaços de mídia mapeados"}</div>
                  </div>
                  <div style={styles.pubStatDivider} />
                  <div style={styles.pubStatItem}>
                    <div style={{ ...styles.pubStatValue, color: "#2F7D5C" }}>{totalDisponivel}</div>
                    <div style={styles.pubStatLabel}>Disponíve{totalDisponivel === 1 ? "l" : "is"} agora</div>
                  </div>
                </div>

                <div style={styles.pubItemsGrid}>
                  {items.map((item) => {
                    const m = PUBLIC_STATUS_META[item.status] || PUBLIC_STATUS_META.disponivel;
                    return (
                      <div key={item.id} style={styles.pubItemCard}>
                        <div style={{ ...styles.pubItemPhoto, background: item.fotoUrl ? "#000" : tint }}>
                          <PhotoImg
                            src={item.fotoUrl}
                            alt={item.local}
                            style={styles.pubItemPhotoImg}
                            fallback={<span style={styles.pubItemPhotoIcon}>{c.icon}</span>}
                          />
                          <span style={{ ...styles.pubItemBadge, color: m.color, background: m.bg }}>{m.label}</span>
                        </div>

                        <div style={styles.pubItemBody}>
                          <div style={styles.pubItemLocal}>{item.local}</div>
                          <div style={styles.pubItemMeta}>
                            {item.tipoMidia}
                            {item.tamanho && item.tamanho !== "—" ? ` · ${item.tamanho}` : ""}
                          </div>

                          {item.status === "indisponivel" && item.patrocinador && (
                            <div style={styles.pubItemPartner}>
                              <span style={styles.pubItemPartnerLabel}>Patrocinador:</span> {item.patrocinador}
                            </div>
                          )}

                          {item.status !== "indisponivel" && (
                            <a
                              href={waLink(
                                `Olá! Tenho interesse no espaço "${item.local}" (${c.name}) do portfólio de mídia do Clube Alemão.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.pubItemCta}
                            >
                              Tenho interesse
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </main>

      <section style={styles.pubFinalCta}>
        <div style={styles.pubFinalCtaTitle}>Vamos conversar sobre a sua marca no Clube Alemão?</div>
        <div style={styles.pubFinalCtaSub}>Consulte disponibilidade e condições comerciais diretamente com a equipe.</div>
        <div style={styles.pubHeroCtas}>
          <a
            href={waLink("Olá! Gostaria de conversar sobre patrocínio no Clube Alemão de Pernambuco.")}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.pubCtaPrimary}
          >
            Falar no WhatsApp
          </a>
        </div>
      </section>

      <footer style={styles.pubFooter}>
        Clube Alemão de Pernambuco · Portfólio de Mídia e Patrocínio · Estruturação NaSala Marketing Digital
      </footer>
    </div>
  );
}

function SellerPortal({ assets, categoryPhotos, sellerNotes, onSaveNote, onLogout, onBack }) {
  const [drafts, setDrafts] = useState(sellerNotes);
  const [savingCat, setSavingCat] = useState(null);

  const byCategory = useMemo(() => {
    const map = {};
    CATEGORIES.forEach((c) => (map[c.id] = []));
    assets.forEach((a) => {
      if (map[a.categoria]) map[a.categoria].push(a);
    });
    return map;
  }, [assets]);

  const saveNote = async (catId) => {
    setSavingCat(catId);
    await onSaveNote(catId, drafts[catId] || "");
    setSavingCat(null);
  };

  return (
    <div style={styles.pubApp}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Manrope', -apple-system, sans-serif; }
        a { text-decoration: none; }
      `}</style>

      <div style={styles.pubUtilityBar}>
        <div style={styles.pubUtilityLeft}>
          <img src={CREST_LOGO} alt="Deutscher Klub Pernambuco" style={styles.pubUtilityCrest} />
          <span style={styles.pubUtilityName}>Portal do Vendedor · DKP</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.pubTeamLink} onClick={onBack}>Ver portfólio público</button>
          <button style={{ ...styles.pubTeamLink, background: "transparent", border: "1px solid rgba(255,255,255,0.4)", color: "#FFFFFF" }} onClick={onLogout}>
            Sair
          </button>
        </div>
      </div>

      <main style={styles.pubMain}>
        <div style={{ padding: "20px 0 0" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1B2A41", margin: 0 }}>Prospecção por espaço</h1>
          <p style={{ fontSize: 13.5, color: "#6B7280", marginTop: 6 }}>
            Para cada espaço, veja o resumo do inventário e busque empresas da região que combinam com o perfil do
            público daquele ambiente. O botão abre o Google Maps de verdade, numa nova aba, já com a busca pronta.
          </p>
        </div>

        {CATEGORIES.filter((c) => byCategory[c.id]).map((c) => {
          const items = byCategory[c.id];
          const totalMapeado = items.length;
          const totalDisponivel = items.filter((i) => i.status === "disponivel").length;
          const photo = categoryPhotos[c.id];
          const tint = CATEGORY_TINTS[c.id] || "#1B2A41";
          return (
            <section key={c.id} style={styles.pubCategorySection}>
              <div style={{ ...styles.pubCategoryBanner, background: photo ? "#000" : tint }}>
                <PhotoImg src={photo} alt={c.name} style={styles.pubCategoryBannerImg} fallback={<div style={styles.pubCategoryBannerIcon}>{c.icon}</div>} />
                <div style={styles.pubCategoryBannerOverlay} />
                <div style={styles.pubCategoryBannerContent}>
                  <div style={styles.pubCategoryBannerAccent} />
                  <div style={styles.pubCategoryBannerTitle}>{c.name}</div>
                  <div style={styles.pubCategoryBannerMeta}>{c.meta}</div>
                </div>
              </div>

              <div style={styles.pubCategoryStatsCard}>
                <div style={styles.pubStatItem}>
                  <div style={styles.pubStatValue}>{totalMapeado}</div>
                  <div style={styles.pubStatLabel}>Espaços mapeados</div>
                </div>
                <div style={styles.pubStatDivider} />
                <div style={styles.pubStatItem}>
                  <div style={{ ...styles.pubStatValue, color: "#2F7D5C" }}>{totalDisponivel}</div>
                  <div style={styles.pubStatLabel}>Disponíveis agora</div>
                </div>
              </div>

              <div style={styles.sellerNoteBox}>
                <div style={styles.sellerNoteHeader}>
                  <a
                    href={mapsSearchLink(SELLER_SEARCH_TERMS[c.id] || c.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.sellerMapsBtn}
                  >
                    Ver empresas no Google Maps →
                  </a>
                </div>
                <label style={styles.sellerNoteLabel}>Empresas identificadas (anotações da equipe)</label>
                <textarea
                  style={styles.sellerNoteTextarea}
                  rows={3}
                  value={drafts[c.id] || ""}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  placeholder="Ex: Movimento Moda Praia, Rush Moda Praia..."
                />
                <button
                  style={styles.sellerNoteSaveBtn}
                  onClick={() => saveNote(c.id)}
                  disabled={savingCat === c.id}
                >
                  {savingCat === c.id ? "Salvando…" : "Salvar anotações"}
                </button>
              </div>
            </section>
          );
        })}
      </main>

      <footer style={styles.pubFooter}>
        Clube Alemão de Pernambuco · Portal do Vendedor · Estruturação NaSala Marketing Digital
      </footer>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("public"); // 'public' | 'team'
  const [unlocked, setUnlocked] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState(INITIAL_DATA);
  const [categoryPhotos, setCategoryPhotos] = useState(EMPTY_PHOTOS);
  const [sellerNotes, setSellerNotes] = useState(EMPTY_SELLER_NOTES);
  const [activeCategory, setActiveCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [view, setView] = useState("inventory"); // 'inventory' | 'dashboard'
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [dbError, setDbError] = useState(false);
  const debouncedSearch = useDebounced(search, 200);
  const isMobile = useIsMobile();

  useEffect(() => {
    setEditingPhoto(false);
  }, [activeCategory]);

  // Detecta login/logout via Supabase Auth (substitui a antiga senha fixa).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUnlocked(true);
        setUserEmail(data.session.user.email || "");
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUnlocked(!!session);
      setUserEmail(session?.user?.email || "");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load from persistent shared storage (Supabase) — roda sempre, independente
  // de login, porque a página pública também precisa dos dados.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const parsed = await loadAppState();
        if (cancelled) return;
        const loadedAssets = Array.isArray(parsed) ? parsed : parsed?.assets;
        const loadedPhotos = Array.isArray(parsed) ? EMPTY_PHOTOS : parsed?.categoryPhotos || EMPTY_PHOTOS;
        const loadedNotes = Array.isArray(parsed) ? EMPTY_SELLER_NOTES : parsed?.sellerNotes || EMPTY_SELLER_NOTES;
        if (Array.isArray(loadedAssets) && loadedAssets.length > 0) {
          setAssets(loadedAssets);
          setCategoryPhotos({ ...EMPTY_PHOTOS, ...loadedPhotos });
          setSellerNotes({ ...EMPTY_SELLER_NOTES, ...loadedNotes });
        } else {
          // Banco ainda vazio — semeia com os dados iniciais do levantamento.
          await saveAppState({ assets: INITIAL_DATA, categoryPhotos: EMPTY_PHOTOS, sellerNotes: EMPTY_SELLER_NOTES });
        }
      } catch (err) {
        console.error("Falha ao carregar dados do Supabase", err);
        if (!cancelled) setDbError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (nextAssets, nextPhotos) => {
    setSaveState("saving");
    try {
      const res = await saveAppState({ assets: nextAssets, categoryPhotos: nextPhotos, sellerNotes });
      setSaveState(res ? "saved" : "error");
      setTimeout(() => setSaveState("idle"), 1500);
    } catch (err) {
      console.error("Erro ao salvar", err);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 2000);
    }
  }, [sellerNotes]);

  const handleSaveSellerNote = useCallback(async (catId, text) => {
    const nextNotes = { ...sellerNotes, [catId]: text };
    setSellerNotes(nextNotes);
    try {
      await saveAppState({ assets, categoryPhotos, sellerNotes: nextNotes });
    } catch (err) {
      console.error("Erro ao salvar anotações do vendedor", err);
    }
  }, [assets, categoryPhotos, sellerNotes]);

  const handleSaveAsset = (updated) => {
    setAssets((prev) => {
      const next = prev.map((a) => (a.id === updated.id ? updated : a));
      persist(next, categoryPhotos);
      return next;
    });
  };

  const handleSavePhoto = (categoryId, url) => {
    setCategoryPhotos((prev) => {
      const next = { ...prev, [categoryId]: url };
      persist(assets, next);
      return next;
    });
  };

  const counts = useMemo(() => {
    const c = { disponivel: 0, negociacao: 0, indisponivel: 0, total: assets.length };
    assets.forEach((a) => (c[a.status] = (c[a.status] || 0) + 1));
    return c;
  }, [assets]);

  const categoryCounts = useMemo(() => {
    const m = {};
    CATEGORIES.forEach((c) => (m[c.id] = { total: 0, disponivel: 0, negociacao: 0, indisponivel: 0 }));
    assets.forEach((a) => {
      if (!m[a.categoria]) return;
      m[a.categoria].total += 1;
      m[a.categoria][a.status] += 1;
    });
    return m;
  }, [assets]);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (activeCategory !== "all" && a.categoria !== activeCategory) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const hay = `${a.local} ${a.patrocinador} ${a.responsavel} ${a.tipoMidia} ${a.observacoes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [assets, activeCategory, statusFilter, debouncedSearch]);

  if (mode === "public") {
    return (
      <PublicShowcase
        assets={assets}
        categoryPhotos={categoryPhotos}
        loading={loading}
        dbError={dbError}
        onTeamAccess={() => setMode("team")}
        onSellerAccess={() => setMode("seller")}
      />
    );
  }

  if (!unlocked) {
    return <Gate onBack={() => setMode("public")} />;
  }

  if (mode === "seller") {
    return (
      <SellerPortal
        assets={assets}
        categoryPhotos={categoryPhotos}
        sellerNotes={sellerNotes}
        onSaveNote={handleSaveSellerNote}
        onLogout={() => supabase.auth.signOut()}
        onBack={() => setMode("public")}
      />
    );
  }

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; font-family: 'Manrope', -apple-system, sans-serif; }
        ::placeholder { color: #9AA1AC; }
        button { cursor: pointer; font-family: inherit; }
        input, textarea, select { font-family: inherit; }
      `}</style>

      <header style={{ ...styles.header, ...(isMobile ? styles.headerMobile : {}) }}>
        <div style={styles.headerLeft}>
          <img src={CREST_LOGO} alt="Deutscher Klub Pernambuco" style={styles.crestImg} />
          <div>
            <div style={styles.headerTitle}>Inventário de Mídia e Patrocínio</div>
            {!isMobile && (
              <div style={styles.headerSub}>Deutscher Klub Pernambuco · Setor de Eventos e Experiência do Sócio</div>
            )}
          </div>
        </div>
        <div style={{ ...styles.headerRight, ...(isMobile ? styles.headerRightMobile : {}) }}>
          {!isMobile && (
            <>
              <div style={styles.userEmailTag} title={userEmail}>{userEmail}</div>
              <div style={styles.saveIndicator}>
                {saveState === "saving" && "Salvando…"}
                {saveState === "saved" && "✓ Salvo"}
                {saveState === "error" && "Falha ao salvar"}
              </div>
            </>
          )}
          <button
            style={{ ...styles.headerGhostBtn, ...(isMobile ? styles.headerBtnMobile : {}) }}
            onClick={() => setMode("public")}
          >
            Ver página pública
          </button>
          <button
            style={{ ...styles.dashboardBtn, ...(isMobile ? styles.headerBtnMobile : {}) }}
            onClick={() => setView(view === "dashboard" ? "inventory" : "dashboard")}
          >
            {view === "dashboard" ? "Ver inventário" : "Dashboard"}
          </button>
          <button
            style={{ ...styles.headerGhostBtn, ...(isMobile ? styles.headerBtnMobile : {}) }}
            onClick={() => supabase.auth.signOut()}
          >
            Sair
          </button>
          {isMobile && (
            <div style={styles.saveIndicatorMobile}>
              {userEmail && `${userEmail} · `}
              {saveState === "saving" && "Salvando…"}
              {saveState === "saved" && "✓ Salvo"}
              {saveState === "error" && "Falha ao salvar"}
            </div>
          )}
        </div>
      </header>

      {dbError && (
        <div style={styles.dbErrorBanner}>
          Não foi possível conectar ao banco de dados agora — o que você editar pode não ser
          salvo. Recarregue a página; se persistir, avise a equipe técnica.
        </div>
      )}

      {view === "dashboard" ? (
        <Dashboard assets={assets} onBack={() => setView("inventory")} isMobile={isMobile} />
      ) : (
        <>
      <div style={{ ...styles.statsRow, ...(isMobile ? styles.statsRowMobile : {}) }}>
        <StatCard label="Total de ativos" value={counts.total} />
        <StatCard label="Disponíveis" value={counts.disponivel || 0} tone={STATUS_META.disponivel.color} />
        <StatCard label="Em negociação" value={counts.negociacao || 0} tone={STATUS_META.negociacao.color} />
        <StatCard label="Indisponíveis" value={counts.indisponivel || 0} tone={STATUS_META.indisponivel.color} />
      </div>

      <div style={{ ...styles.body, ...(isMobile ? styles.bodyMobile : {}) }}>
        <nav style={{ ...styles.sidebar, ...(isMobile ? styles.sidebarMobile : {}) }}>
          <button
            style={{
              ...styles.navItem,
              ...(isMobile ? styles.navItemMobile : {}),
              ...(activeCategory === "all" ? styles.navItemActive : {}),
            }}
            onClick={() => setActiveCategory("all")}
          >
            <span>Todos os espaços</span>
            <span style={styles.navCount}>{assets.length}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              style={{
                ...styles.navItem,
                ...(isMobile ? styles.navItemMobile : {}),
                ...(activeCategory === c.id ? styles.navItemActive : {}),
              }}
              onClick={() => setActiveCategory(c.id)}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>{c.icon}</span>
                <span>
                  {c.name}
                  {!isMobile && <span style={styles.navMeta}>{c.meta}</span>}
                </span>
              </span>
              <span style={styles.navCount}>{categoryCounts[c.id]?.total ?? 0}</span>
            </button>
          ))}
        </nav>

        <main style={styles.main}>
          {activeCategory !== "all" && (
            <CategoryBanner
              category={CATEGORIES.find((c) => c.id === activeCategory)}
              photoUrl={categoryPhotos[activeCategory]}
              editing={editingPhoto}
              onStartEdit={() => setEditingPhoto(true)}
              onCancelEdit={() => setEditingPhoto(false)}
              onSave={(url) => {
                handleSavePhoto(activeCategory, url);
                setEditingPhoto(false);
              }}
            />
          )}

          <div style={styles.toolbar}>
            <input
              style={styles.searchInput}
              placeholder="Buscar por local, marca ou responsável..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={styles.filterGroup}>
              {["all", "disponivel", "negociacao", "indisponivel"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    ...styles.filterChip,
                    ...(statusFilter === s
                      ? { background: "#1B2A41", color: "#FFF", borderColor: "#1B2A41" }
                      : {}),
                  }}
                >
                  {s === "all" ? "Todos" : STATUS_META[s].label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={styles.emptyState}>Carregando inventário…</div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>Nenhum ativo encontrado com esses filtros.</div>
          ) : (
            <div style={styles.list}>
              {filtered.map((a) => {
                const m = STATUS_META[a.status];
                return (
                  <button key={a.id} style={styles.row} onClick={() => setEditing(a)}>
                    <div style={styles.rowThumb}>
                      <PhotoImg
                        src={a.fotoUrl}
                        alt={a.local}
                        style={styles.rowThumbImg}
                        fallback={
                          <span style={styles.rowThumbIcon}>
                            {CATEGORIES.find((c) => c.id === a.categoria)?.icon}
                          </span>
                        }
                      />
                    </div>
                    <div style={styles.rowMain}>
                      <div style={styles.rowLocal}>{a.local}</div>
                      <div style={styles.rowSub}>
                        {a.tipoMidia}{a.tamanho && a.tamanho !== "—" ? ` · ${a.tamanho}` : ""}
                        {formatValorDisplay(a) ? ` · ${formatValorDisplay(a)}` : ""}
                        {a.prazoMinimo ? ` · mín. ${a.prazoMinimo}` : ""}
                      </div>
                      {a.status === "indisponivel" && a.patrocinador && (
                        <div style={{ ...styles.rowClient, color: m.color }}>
                          Cliente: {a.patrocinador}
                        </div>
                      )}
                      {a.status === "negociacao" && (a.patrocinador || a.negociador) && (
                        <div style={{ ...styles.rowNegotiation, color: m.color }}>
                          {a.patrocinador ? `Negociando com ${a.patrocinador}` : "Em negociação"}
                          {a.negociador ? ` · ${a.negociador}` : ""}
                        </div>
                      )}
                    </div>
                    <div style={styles.rowRight}>
                      {a.responsavel && <span style={styles.rowResp}>{a.responsavel}</span>}
                      <StatusBadge status={a.status} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>
      </div>
      </>
      )}

      {editing && (
        <EditPanel asset={editing} onClose={() => setEditing(null)} onSave={handleSaveAsset} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Styles
--------------------------------------------------------- */

const styles = {
  app: {
    minHeight: "100vh",
    background: "#F6F7F8",
    color: "#1F2933",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 28px",
    background: "#12203A",
    color: "#FFFFFF",
    borderBottom: "3px solid #F5A800",
  },
  headerMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 16px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  crestImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    objectFit: "contain",
    background: "#FFFFFF",
    padding: 4,
    flexShrink: 0,
  },
  headerTitle: { fontSize: 17, fontWeight: 700, lineHeight: 1.3 },
  headerSub: { fontSize: 12.5, color: "#B7C0CE", marginTop: 2 },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  headerRightMobile: { width: "100%", flexWrap: "wrap", gap: 8 },
  headerBtnMobile: { flex: "1 1 auto", textAlign: "center", padding: "10px 12px" },
  headerGhostBtn: {
    padding: "9px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.3)",
    background: "transparent",
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: 700,
  },
  saveIndicator: { fontSize: 12.5, color: "#B7C0CE", minWidth: 90, textAlign: "right" },
  userEmailTag: {
    fontSize: 12,
    color: "#B7C0CE",
    maxWidth: 160,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  saveIndicatorMobile: { fontSize: 11.5, color: "#B7C0CE", width: "100%", textAlign: "left" },
  dashboardBtn: {
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    background: "#F5A800",
    color: "#1B2A41",
    fontSize: 13,
    fontWeight: 800,
    flexShrink: 0,
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    padding: "20px 28px 4px",
  },
  statsRowMobile: {
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    padding: "14px 16px 4px",
    gap: 8,
  },
  statCard: {
    background: "#FFFFFF",
    borderRadius: 10,
    padding: "14px 16px",
    border: "1px solid #E4E7EC",
    borderTop: "3px solid",
  },
  statValue: { fontSize: 24, fontWeight: 800, color: "#1B2A41" },
  statLabel: { fontSize: 12.5, color: "#6B7280", marginTop: 2 },

  body: { display: "flex", flex: 1, padding: "16px 28px 28px", gap: 20, alignItems: "flex-start" },
  bodyMobile: { flexDirection: "column", padding: "12px 12px 20px", gap: 12 },

  sidebar: {
    width: 260,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    background: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    border: "1px solid #E4E7EC",
  },
  sidebarMobile: {
    width: "100%",
    flexDirection: "row",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    gap: 8,
    padding: 8,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    textAlign: "left",
    fontSize: 13.5,
    fontWeight: 600,
    color: "#3D4757",
  },
  navItemMobile: {
    flexShrink: 0,
    borderRadius: 999,
    padding: "8px 12px",
    background: "#F6F7F8",
    whiteSpace: "nowrap",
  },
  navItemActive: { background: "#EFF3F8", color: "#1B2A41" },
  navMeta: { display: "block", fontSize: 11, fontWeight: 500, color: "#9AA1AC", marginTop: 1 },
  navCount: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#6B7280",
    background: "#F1F3F5",
    borderRadius: 999,
    padding: "2px 8px",
    flexShrink: 0,
  },

  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 },
  toolbar: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
  searchInput: {
    flex: "1 1 260px",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #E4E7EC",
    fontSize: 13.5,
    outline: "none",
    background: "#FFFFFF",
  },
  filterGroup: { display: "flex", gap: 6, flexWrap: "wrap" },
  filterChip: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid #E4E7EC",
    background: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: 600,
    color: "#3D4757",
  },

  list: { display: "flex", flexDirection: "column", gap: 8 },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 16px",
    background: "#FFFFFF",
    border: "1px solid #E4E7EC",
    borderRadius: 10,
    textAlign: "left",
    width: "100%",
  },
  rowMain: { minWidth: 0, flex: 1 },
  rowThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    flexShrink: 0,
    background: "#F1F3F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  rowThumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  rowThumbIcon: { fontSize: 18, opacity: 0.5 },
  rowLocal: { fontSize: 13.5, fontWeight: 700, color: "#1F2933" },
  rowSub: { fontSize: 12, color: "#6B7280", marginTop: 3 },
  rowRight: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  rowResp: { fontSize: 11.5, color: "#9AA1AC", fontWeight: 600 },
  rowClient: { fontSize: 13, fontWeight: 800, marginTop: 5 },
  rowNegotiation: { fontSize: 12, fontWeight: 700, marginTop: 5 },

  banner: {
    position: "relative",
    height: 168,
    borderRadius: 12,
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-end",
  },
  bannerImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  bannerIcon: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 56,
    opacity: 0.35,
  },
  bannerOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
  },
  bannerContent: { position: "relative", padding: "14px 18px", zIndex: 1 },
  bannerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: 800 },
  bannerMeta: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },
  bannerEditBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    padding: "6px 12px",
    borderRadius: 999,
    border: "none",
    background: "rgba(255,255,255,0.9)",
    color: "#1B2A41",
    fontSize: 11.5,
    fontWeight: 700,
  },
  bannerEditBox: {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    background: "rgba(27,42,65,0.94)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    overflowY: "auto",
  },
  bannerPreviewRow: { display: "flex", alignItems: "center", gap: 10 },
  bannerPreviewImg: {
    width: 52,
    height: 52,
    borderRadius: 8,
    objectFit: "cover",
    flexShrink: 0,
    border: "1px solid rgba(255,255,255,0.3)",
  },
  bannerPreviewLabel: { color: "rgba(255,255,255,0.85)", fontSize: 11.5, fontWeight: 600 },
  bannerEditControls: { display: "flex", gap: 8, flexWrap: "wrap" },
  bannerUploadBtn: {
    padding: "9px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: 700,
    flexShrink: 0,
  },
  bannerError: { color: "#F5B5A8", fontSize: 11.5, fontWeight: 600 },
  bannerEditActions: { display: "flex", justifyContent: "flex-end", gap: 8 },
  bannerEditInput: {
    flex: "1 1 200px",
    padding: "9px 12px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    outline: "none",
  },
  bannerEditSave: {
    padding: "9px 14px",
    borderRadius: 8,
    border: "none",
    background: "#F5A800",
    color: "#1B2A41",
    fontSize: 12.5,
    fontWeight: 700,
    flexShrink: 0,
  },
  bannerEditCancel: {
    padding: "9px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.4)",
    background: "transparent",
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: 700,
    flexShrink: 0,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 10px",
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  badgeDot: { width: 6, height: 6, borderRadius: 999, display: "inline-block" },

  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#9AA1AC",
    fontSize: 13.5,
    background: "#FFFFFF",
    borderRadius: 10,
    border: "1px dashed #E4E7EC",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(27,42,65,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 50,
  },
  panel: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "88vh",
    overflowY: "auto",
    background: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
  },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  panelEyebrow: { fontSize: 11.5, fontWeight: 700, color: "#F5A800", marginBottom: 4 },
  panelTitle: { fontSize: 17, fontWeight: 800, color: "#1B2A41", lineHeight: 1.3 },
  closeBtn: {
    border: "none",
    background: "#F1F3F5",
    width: 30,
    height: 30,
    borderRadius: 999,
    fontSize: 18,
    color: "#5B6472",
    flexShrink: 0,
    lineHeight: 1,
  },
  panelMetaRow: { display: "flex", gap: 20, marginTop: 16, marginBottom: 20, flexWrap: "wrap" },
  itemPhotoBox: {
    marginTop: 16,
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
    background: "#F1F3F5",
    border: "1px solid #E4E7EC",
  },
  itemPhotoPreview: { width: "100%", height: "100%", objectFit: "cover" },
  itemPhotoPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9AA1AC",
    fontSize: 12.5,
    fontWeight: 600,
  },
  itemPhotoControls: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  itemPhotoUploadBtn: {
    padding: "9px 14px",
    borderRadius: 8,
    border: "1px solid #E4E7EC",
    background: "#FFFFFF",
    color: "#1B2A41",
    fontSize: 12.5,
    fontWeight: 700,
    flexShrink: 0,
  },
  itemPhotoUrlInput: {
    flex: "1 1 160px",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #E4E7EC",
    fontSize: 12.5,
    outline: "none",
  },
  itemPhotoRemoveBtn: {
    padding: "9px 12px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#B03A2E",
    fontSize: 12.5,
    fontWeight: 700,
    flexShrink: 0,
  },
  panelMetaLabel: { fontSize: 10.5, fontWeight: 700, color: "#9AA1AC", textTransform: "uppercase", letterSpacing: 0.4 },
  panelMetaValue: { fontSize: 13, fontWeight: 600, color: "#3D4757", marginTop: 2 },

  field: { marginBottom: 16 },
  fieldRow: { display: "flex", gap: 12, marginBottom: 0, flexWrap: "wrap" },
  emphasisBox: {
    border: "1.5px solid",
    borderRadius: 10,
    padding: "14px 14px 16px",
    marginBottom: 16,
  },
  emphasisTitle: { fontSize: 12, fontWeight: 800, marginBottom: 6 },
  emphasisInput: { background: "#FFFFFF" },
  label: { display: "block", fontSize: 12, fontWeight: 700, color: "#3D4757", marginBottom: 6 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #E4E7EC",
    fontSize: 13.5,
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #E4E7EC",
    fontSize: 13.5,
    outline: "none",
    resize: "vertical",
  },
  statusOptions: { display: "flex", gap: 8, flexWrap: "wrap" },
  statusOption: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1.5px solid #E4E7EC",
    fontSize: 12.5,
    fontWeight: 700,
    background: "#FFF",
  },
  panelFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 },
  secondaryBtn: {
    padding: "10px 16px",
    borderRadius: 8,
    border: "1px solid #E4E7EC",
    background: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700,
    color: "#3D4757",
  },
  primaryBtn: {
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    background: "#1B2A41",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700,
  },

  gateWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1B2A41",
    padding: 20,
  },
  gateCard: {
    width: "100%",
    maxWidth: 360,
    background: "#FFFFFF",
    borderRadius: 16,
    padding: "36px 32px",
    textAlign: "center",
  },
  gateCrestImg: {
    width: 72,
    height: 72,
    objectFit: "contain",
    margin: "0 auto 18px",
    display: "block",
    background: "#FFFFFF",
    borderRadius: 14,
    padding: 6,
  },
  gateTitle: { fontSize: 17, fontWeight: 800, color: "#1B2A41" },
  gateSub: { fontSize: 12.5, color: "#6B7280", marginTop: 6, lineHeight: 1.5 },
  gateInput: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #E4E7EC",
    fontSize: 14,
    outline: "none",
    textAlign: "center",
  },
  gateError: { fontSize: 12, color: "#B03A2E", marginTop: 8 },
  gateButton: {
    width: "100%",
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 8,
    border: "none",
    background: "#1B2A41",
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: 700,
  },
  gateBackLink: {
    width: "100%",
    marginTop: 12,
    padding: "8px",
    border: "none",
    background: "transparent",
    color: "#6B7280",
    fontSize: 12.5,
    fontWeight: 600,
  },

  dashWrap: { padding: "24px 28px 40px", display: "flex", flexDirection: "column", gap: 22 },
  dashWrapMobile: { padding: "16px 14px 30px", gap: 16 },
  dashHeaderRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 },
  dashTitle: { fontSize: 21, fontWeight: 800, color: "#1B2A41" },
  dashSub: { fontSize: 13, color: "#6B7280", marginTop: 3 },

  dashKpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 },
  dashKpiCard: {
    background: "#FFFFFF",
    border: "1px solid #E4E7EC",
    borderRadius: 12,
    padding: "18px 18px 16px",
    borderTop: "3px solid #F5A800",
  },
  dashKpiLabel: { fontSize: 12, fontWeight: 700, color: "#6B7280" },
  dashKpiValue: { fontSize: 26, fontWeight: 800, color: "#1B2A41", marginTop: 6 },
  dashKpiNote: { fontSize: 11, color: "#9AA1AC", marginTop: 6, lineHeight: 1.4 },

  dashAlert: {
    background: "#FBF0DD",
    color: "#8A6A34",
    border: "1px solid #EFD9AE",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 12.5,
    fontWeight: 600,
  },

  dashSectionTitle: { fontSize: 15, fontWeight: 800, color: "#1B2A41", marginTop: 4 },

  dashTableWrap: { background: "#FFFFFF", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "auto" },
  dashTable: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  dashTh: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: 11,
    fontWeight: 800,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    borderBottom: "1px solid #E4E7EC",
    whiteSpace: "nowrap",
  },
  dashTd: {
    padding: "12px 16px",
    borderBottom: "1px solid #F1F3F5",
    color: "#1F2933",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  namingGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 },
  namingCard: { background: "#FFFFFF", border: "1px solid #E4E7EC", borderRadius: 10, padding: 14 },
  namingCategory: { fontSize: 12.5, fontWeight: 700, color: "#3D4757" },
  namingStatus: { fontSize: 12, fontWeight: 800, marginTop: 8 },
  namingClient: { fontSize: 12.5, fontWeight: 700, color: "#1B2A41", marginTop: 4 },
  namingValue: { fontSize: 12, color: "#9AA1AC", marginTop: 4, fontWeight: 600 },

  /* ---------------- Página pública (vitrine comercial) ---------------- */
  pubApp: { minHeight: "100vh", background: "#F6F7F8", color: "#1F2933" },
  dbErrorBanner: {
    background: "#FBE7E8",
    color: "#B03A2E",
    textAlign: "center",
    padding: "10px 16px",
    fontSize: 12.5,
    fontWeight: 700,
  },

  pubUtilityBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#12203A",
    borderBottom: "3px solid #F5A800",
  },
  pubUtilityLeft: { display: "flex", alignItems: "center", gap: 10 },
  pubUtilityCrest: { width: 30, height: 30, objectFit: "contain", background: "#FFFFFF", borderRadius: 6, padding: 2 },
  pubUtilityName: { color: "#FFFFFF", fontSize: 12.5, fontWeight: 700 },
  pubTeamLink: {
    border: "none",
    background: "#F5A800",
    color: "#1B2A41",
    fontSize: 12,
    fontWeight: 800,
    padding: "9px 16px",
    borderRadius: 999,
  },

  pubHero: {
    position: "relative",
    background: "linear-gradient(135deg, #12203A 0%, #1B2A41 55%, #223655 100%)",
    padding: "64px 24px 60px",
    overflow: "hidden",
  },
  pubHeroShapeRed: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: "0 0 0 220px",
    background: "#E4222B",
    opacity: 0.9,
  },
  pubHeroShapeGold: {
    position: "absolute",
    bottom: -70,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: "0 220px 0 0",
    background: "#F5A800",
    opacity: 0.16,
  },
  pubHeroOverlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 85% 15%, rgba(228,34,43,0.18), transparent 55%)",
  },
  pubHeroContent: { position: "relative", maxWidth: 720, margin: "0 auto", textAlign: "center" },
  pubHeroCrestImg: {
    width: 92,
    height: 92,
    objectFit: "contain",
    margin: "0 auto 20px",
    display: "block",
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  },
  pubHeroEyebrow: { color: "#F5A800", fontSize: 12.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" },
  pubHeroTitle: { color: "#FFFFFF", fontSize: 34, fontWeight: 800, lineHeight: 1.25, marginTop: 14 },
  pubHeroSub: { color: "rgba(255,255,255,0.8)", fontSize: 15, lineHeight: 1.6, marginTop: 14, maxWidth: 560, marginLeft: "auto", marginRight: "auto" },
  pubHeroCtas: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 },
  pubCtaPrimary: { padding: "14px 30px", borderRadius: 10, background: "#25D366", color: "#0B3B1E", fontWeight: 800, fontSize: 14.5 },
  pubCtaSecondary: {
    padding: "13px 26px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.1)",
    border: "1.5px solid rgba(255,255,255,0.35)",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 14,
  },
  pubCtaSecondaryDark: {
    padding: "13px 26px",
    borderRadius: 10,
    background: "transparent",
    border: "1.5px solid rgba(255,255,255,0.5)",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 14,
  },
  pubStatsBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    padding: "26px 20px",
    background: "#FFFFFF",
    borderBottom: "1px solid #E4E7EC",
    flexWrap: "wrap",
  },
  pubStatItem: { textAlign: "center" },
  pubStatValue: { fontSize: 26, fontWeight: 800, color: "#1B2A41" },
  pubStatLabel: { fontSize: 11.5, color: "#6B7280", fontWeight: 600, marginTop: 2 },
  pubStatDivider: { width: 1, height: 32, background: "#E4E7EC" },
  pubPartnersSection: { padding: "32px 24px 8px", maxWidth: 960, margin: "0 auto", textAlign: "center" },
  pubSectionEyebrow: { fontSize: 12, fontWeight: 800, color: "#F5A800", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 14 },
  pubPartnersWall: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  pubPartnerChip: {
    padding: "9px 16px",
    borderRadius: 999,
    background: "#FFFFFF",
    border: "1px solid #E4E7EC",
    color: "#1B2A41",
    fontWeight: 700,
    fontSize: 12.5,
  },
  pubQuickNav: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", padding: "20px 24px", maxWidth: 1000, margin: "0 auto" },
  pubQuickNavItem: {
    padding: "9px 16px",
    borderRadius: 999,
    background: "#FFFFFF",
    border: "1.5px solid #E4E7EC",
    color: "#3D4757",
    fontWeight: 700,
    fontSize: 12.5,
  },
  pubQuickNavItemActive: {
    background: "#1B2A41",
    borderColor: "#1B2A41",
    color: "#FFFFFF",
  },
  pubMain: { maxWidth: 1000, margin: "0 auto", padding: "8px 24px 40px", display: "flex", flexDirection: "column", gap: 40 },
  pubLoadingState: { textAlign: "center", padding: "60px 20px", color: "#9AA1AC", fontSize: 14 },
  pubCategorySection: { display: "flex", flexDirection: "column", gap: 14 },
  pubCategorySummary: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "#3D4757",
    fontWeight: 600,
  },
  pubCategorySummaryDivider: { color: "#C7CBD1" },
  pubCategorySummaryAvailable: { color: "#2F7D5C" },
  pubCategoryStatsCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 36,
    background: "#FFFFFF",
    border: "1px solid #E4E7EC",
    borderRadius: 14,
    padding: "18px 20px",
    boxShadow: "0 4px 14px rgba(27,42,65,0.05)",
  },
  pubCategoryBanner: {
    position: "relative",
    width: "100%",
    paddingTop: "56.25%", // técnica de proporção 16:9 compatível com qualquer navegador (não depende de aspect-ratio)
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(27,42,65,0.12)",
  },
  pubCategoryBannerImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" },
  pubCategoryBannerIcon: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 96,
    opacity: 0.32,
  },
  pubCategoryBannerOverlay: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)" },
  pubCategoryBannerContent: { position: "absolute", left: 0, right: 0, bottom: 0, padding: "22px 26px", zIndex: 1 },
  pubCategoryBannerAccent: { width: 40, height: 4, background: "#F5A800", borderRadius: 999, marginBottom: 10 },
  pubCategoryBannerTitle: { color: "#FFFFFF", fontSize: 25, fontWeight: 800 },
  pubCategoryBannerMeta: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 3 },
  pubItemsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 },
  pubItemCard: {
    background: "#FFFFFF",
    border: "1px solid #E4E7EC",
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 14px rgba(27,42,65,0.05)",
  },
  pubItemPhoto: {
    position: "relative",
    width: "100%",
    paddingTop: "75%", // proporção 4:3 compatível com qualquer navegador (não depende de aspect-ratio)
  },
  pubItemPhotoImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  pubItemPhotoIcon: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    opacity: 0.45,
  },
  pubItemBody: { padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  pubItemLocal: { fontSize: 13.5, fontWeight: 700, color: "#1F2933", lineHeight: 1.35 },
  pubItemBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 10.5,
    fontWeight: 800,
    padding: "4px 9px",
    borderRadius: 999,
    whiteSpace: "nowrap",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  pubItemMeta: { fontSize: 12, color: "#6B7280" },
  pubItemPartner: { fontSize: 12.5, fontWeight: 700, color: "#1B2A41", marginTop: "auto" },
  pubItemPartnerLabel: { color: "#8A6A34", fontWeight: 800 },
  pubItemCta: {
    display: "inline-block",
    textAlign: "center",
    fontSize: 12.5,
    fontWeight: 800,
    color: "#1B2A41",
    marginTop: "auto",
    paddingTop: 9,
    paddingBottom: 9,
    background: "transparent",
    border: "1.5px solid #F5A800",
    borderRadius: 8,
  },
  pubFinalCta: { background: "#1B2A41", padding: "56px 24px", textAlign: "center" },
  pubFinalCtaTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: 800, maxWidth: 520, margin: "0 auto" },
  pubFinalCtaSub: { color: "rgba(255,255,255,0.75)", fontSize: 13.5, marginTop: 10 },
  pubFooter: { textAlign: "center", padding: "20px", fontSize: 11.5, color: "#9AA1AC", background: "#F6F7F8" },

  sellerNoteBox: {
    background: "#FFFFFF",
    border: "1px solid #E4E7EC",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  sellerNoteHeader: { display: "flex" },
  sellerMapsBtn: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: 8,
    background: "#1B2A41",
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: 800,
  },
  sellerNoteLabel: { fontSize: 11.5, fontWeight: 700, color: "#6B7280", marginTop: 4 },
  sellerNoteTextarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #E4E7EC",
    fontSize: 13,
    outline: "none",
    resize: "vertical",
    fontFamily: "'Manrope', -apple-system, sans-serif",
  },
  sellerNoteSaveBtn: {
    alignSelf: "flex-start",
    padding: "9px 16px",
    borderRadius: 8,
    border: "none",
    background: "#F5A800",
    color: "#1B2A41",
    fontSize: 12.5,
    fontWeight: 800,
  },
};
