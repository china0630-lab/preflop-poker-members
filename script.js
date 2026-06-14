const AUTH_KEY = "preflop_member_session";
const USERS_KEY = "preflop_member_users";
const INVITE_CODES = ["PREFLOP-2026", "YUJI-WEEKLY", "RANGE-LAB"];
const SUPABASE_CONFIG = window.PREFLOP_SUPABASE_CONFIG || {};
const supabaseClient = createSupabaseClient();

let currentSession = null;
let authReady = !supabaseClient;

const rangeData = {
  UTG: ["15%", "後ろに5人。強いハンド中心で参加。", "AA KK QQ AKs", "JJ TT AQs AKo"],
  HJ: ["19%", "後ろの人数が減り、スーテッド系が少し増える。", "AA KK QQ JJ", "ATs KQs QJs 99"],
  CO: ["27%", "BTNを除けばかなり攻められる位置。", "AA-99 AK AQ", "Axs KTs QTs 87s"],
  BTN: ["43%", "後ろは2人。最も広く参加できるポジション。", "AA-77 Ax Kx", "Q9s J9s T8s 65s"],
  SB: ["36%", "安く見えて難しい。BBに対して慎重に設計。", "AA-88 A9s+", "KTs QTs JTs A5s"],
  BB: ["Defense", "オープンではなく、守るレンジを考える位置。", "AA-99 AK AQ", "相手位置で調整"]
};

const app = document.querySelector("#app");
const headerActions = document.querySelector("#headerActions");

function createSupabaseClient() {
  if (!SUPABASE_CONFIG.enabled) return null;
  if (!window.supabase || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) return null;
  return window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  if (supabaseClient) return currentSession;
  return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
}

function setSession(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ id: user.id, email: user.email }));
}

function logout() {
  if (supabaseClient) {
    supabaseClient.auth.signOut().finally(() => {
      currentSession = null;
      render();
    });
    return;
  }
  localStorage.removeItem(AUTH_KEY);
  render();
}

async function loadSupabaseSession() {
  if (!supabaseClient) return;
  authReady = false;
  const { data } = await supabaseClient.auth.getSession();
  currentSession = data.session ? await buildSupabaseSession(data.session.user) : null;
  authReady = true;
}

async function buildSupabaseSession(user) {
  const profile = await fetchMemberProfile(user.id);
  return {
    id: user.id,
    email: user.email,
    membershipStatus: profile?.membership_status || "inactive",
    plan: profile?.plan || "free"
  };
}

async function fetchMemberProfile(userId) {
  const { data, error } = await supabaseClient
    .from("preflop_profiles")
    .select("membership_status, plan")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Failed to load member profile", error);
    return null;
  }
  return data;
}

function hasMemberAccess(session = getSession()) {
  if (!session) return false;
  if (!supabaseClient) return true;
  return ["free", "trialing", "active"].includes(session.membershipStatus);
}

function escapeHtml(value = "") {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatDate(date) {
  return date.replaceAll("-", ".");
}

function articleUrl(article) {
  return `#article/${article.id}`;
}

function renderHeader() {
  const session = getSession();
  const memberLabel = session ? session.email.split("@")[0] : "";
  headerActions.innerHTML = session
    ? `<span class="member-chip">${escapeHtml(memberLabel)}さん</span><button class="ghost-button" data-logout>ログアウト</button>`
    : `<a class="ghost-button" href="#login">ログイン</a><a class="primary-button compact" href="#register">新規登録</a>`;

  const logoutButton = headerActions.querySelector("[data-logout]");
  if (logoutButton) logoutButton.addEventListener("click", logout);
}

function renderHome() {
  const session = getSession();
  const featured = window.PREFLOP_ARTICLES.find((article) => article.featured);
  const latest = [...window.PREFLOP_ARTICLES].sort((a, b) => b.date.localeCompare(a.date));

  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Member Strategy Lab</p>
        <h1>毎週、勝てる判断を積み上げる。</h1>
        <p class="lead">
          PreFlopは、ユウジさんの記事を毎週追加していく会員制ポーカー攻略サイトです。
          レンジ・エクイティ・期待値を、読み物と図解で学べる場所に育てていきます。
        </p>
        <div class="hero-actions">
          <a class="primary-button" href="${articleUrl(featured)}">最新記事を読む</a>
          <a class="secondary-button" href="#articles">記事一覧を見る</a>
        </div>
      </div>
      ${renderRangeTool()}
    </section>

    <section class="ops-strip">
      <div>
        <span>Weekly Update</span>
        <strong>記事データを1本追加するだけ</strong>
        <small>content/articles.js に追加すると一覧と詳細ページへ反映</small>
      </div>
      <div>
        <span>Membership</span>
        <strong>ログイン・招待コード登録</strong>
        <small>本番ではSupabase Authなどへ差し替え可能</small>
      </div>
      <div>
        <span>Stable URL</span>
        <strong>GitHub Pagesで固定URL化</strong>
        <small>毎週の記事更新後も同じURLを維持</small>
      </div>
    </section>

    <section class="featured-grid">
      <article class="featured-article">
        <div class="article-kicker">Featured Guide</div>
        <h2>${escapeHtml(featured.title)}</h2>
        <p>${escapeHtml(featured.subtitle)}</p>
        <div class="article-meta">
          <span>${escapeHtml(featured.category)}</span>
          <span>読了 ${featured.readTime}</span>
          <span>更新 ${formatDate(featured.date)}</span>
          <span>${featured.memberOnly ? "会員限定" : "無料公開"}</span>
        </div>
        <figure class="source-board">
          <figcaption>
            <span>Core Visual</span>
            <strong>ポーカーの本質：確率とエクイティの全体図</strong>
            <small>全体像を見たあと、記事内で2つの章に分けて読めます。</small>
          </figcaption>
          <img src="${featured.images.overview}" alt="プリフロップ表の本質とエクイティを奪うゲームを説明した図解" />
        </figure>
      </article>
      <aside class="memo-stack">
        <div class="memo-card accent">
          <span>Status</span>
          <strong>${session ? (hasMemberAccess(session) ? "ログイン中。会員限定記事を読めます。" : "ログイン済み。会員権限の確認待ちです。") : "ログインすると会員限定記事を読めます。"}</strong>
        </div>
        <div class="memo-card">
          <span>Invitation</span>
          <strong>招待コードは管理者から共有された人だけが登録に使えます。</strong>
        </div>
        <div class="memo-card">
          <span>Next article</span>
          <strong>次回記事は content/articles.js に追加して公開できます。</strong>
        </div>
      </aside>
    </section>

    ${renderArticleList(latest)}
  `;
}

function renderRangeTool() {
  return `
    <aside id="range-tool" class="lab-panel" aria-label="プリフロップレンジチェック">
      <div class="panel-head"><span>Range Check</span><strong id="rangeMode">6-max / UTG Open</strong></div>
      <div class="position-tabs" role="tablist" aria-label="ポジション">
        ${Object.keys(rangeData).map((key) => `<button class="${key === "UTG" ? "active" : ""}" data-position="${key}" type="button">${key}</button>`).join("")}
      </div>
      <div class="range-summary">
        <div class="range-number"><small id="positionLabel">UTG 推奨参加率</small><strong id="rangePercent">15%</strong></div>
        <div><p id="rangeText">後ろに5人。強いハンド中心で参加。</p><div class="meter"><span id="rangeMeter" style="width: 15%"></span></div></div>
      </div>
      <div class="starter-hands">
        <div><span>かなり強い</span><strong id="premiumHands">AA KK QQ AKs</strong></div>
        <div><span>参加候補</span><strong id="candidateHands">JJ TT AQs AKo</strong></div>
      </div>
    </aside>
  `;
}

function wireRangeTool() {
  document.querySelectorAll("[data-position]").forEach((button) => {
    button.addEventListener("click", () => {
      const position = button.dataset.position;
      const [percent, text, premium, candidates] = rangeData[position];
      document.querySelectorAll("[data-position]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelector("#rangeMode").textContent = `6-max / ${position} Open`;
      document.querySelector("#positionLabel").textContent = `${position} 推奨`;
      document.querySelector("#rangePercent").textContent = percent;
      document.querySelector("#rangeText").textContent = text;
      document.querySelector("#rangeMeter").style.width = percent === "Defense" ? "58%" : percent;
      document.querySelector("#premiumHands").textContent = premium;
      document.querySelector("#candidateHands").textContent = candidates;
    });
  });
}

function renderArticleList(articles = window.PREFLOP_ARTICLES) {
  return `
    <section id="articles" class="article-library">
      <div class="section-head">
        <div><p class="eyebrow">Article Library</p><h2>毎週増えていく攻略記事</h2></div>
        <label class="search library-search"><span>Search</span><input id="articleSearch" type="search" placeholder="記事を探す" /></label>
      </div>
      <div class="cards" id="articleCards">
        ${articles.map((article) => `
          <article class="article-card" data-title="${escapeHtml(article.title)} ${escapeHtml(article.category)} ${escapeHtml(article.tags.join(" "))}">
            <span>${escapeHtml(article.category)} / ${formatDate(article.date)}</span>
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.subtitle)}</p>
            <a href="${articleUrl(article)}">${article.memberOnly ? "会員記事を読む" : "読む"}</a>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function wireArticleSearch() {
  const input = document.querySelector("#articleSearch");
  if (!input) return;
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    document.querySelectorAll(".article-card").forEach((card) => {
      card.classList.toggle("hidden", query && !card.dataset.title.toLowerCase().includes(query));
    });
  });
}

function renderArticle(id) {
  const article = window.PREFLOP_ARTICLES.find((item) => item.id === id);
  if (!article) {
    app.innerHTML = `<section class="auth-shell"><h1>記事が見つかりません</h1><a class="primary-button" href="#articles">記事一覧へ戻る</a></section>`;
    return;
  }

  if (!authReady) {
    app.innerHTML = `<section class="auth-shell"><p class="eyebrow">Checking</p><h1>ログイン状態を確認しています。</h1></section>`;
    return;
  }

  if (article.memberOnly && !hasMemberAccess()) {
    app.innerHTML = `
      <section class="auth-shell">
        <p class="eyebrow">Members Only</p>
        <h1>この記事は会員限定です。</h1>
        <p>${getSession() ? "このアカウントには現在、会員記事の閲覧権限がありません。" : "ログイン、または招待コードで新規登録すると読めます。"}</p>
        <div class="hero-actions"><a class="primary-button" href="#login">ログイン</a><a class="secondary-button" href="#register">新規登録</a></div>
      </section>
    `;
    return;
  }

  app.innerHTML = `
    <section class="article-hero">
      <p class="eyebrow">${escapeHtml(article.category)}</p>
      <h1>${escapeHtml(article.title)}</h1>
      <p>${escapeHtml(article.subtitle)}</p>
      <div class="article-meta">
        <span>著者 ${escapeHtml(article.author)}</span>
        <span>読了 ${article.readTime}</span>
        <span>更新 ${formatDate(article.date)}</span>
        <span>${article.memberOnly ? "会員限定" : "無料公開"}</span>
      </div>
    </section>
    <section class="content-layout">
      <article class="longform">${article.body.map(renderBlock).join("")}</article>
      <aside class="side-rail">
        <div class="sticky-box"><h3>この記事の要点</h3><ol>${article.summary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></div>
      </aside>
    </section>
  `;
}

function renderBlock(block) {
  if (block.type === "heading") return `<h2>${escapeHtml(block.text)}</h2>`;
  if (block.type === "paragraph") return `<p>${escapeHtml(block.text)}</p>`;
  if (block.type === "callout") return `<div class="callout"><strong>${escapeHtml(block.text)}</strong></div>`;
  if (block.type === "image-pair") {
    return `<div class="source-splits">${block.items.map((item) => `
      <figure class="source-crop"><figcaption>${escapeHtml(item.title)}</figcaption><img src="${item.src}" alt="${escapeHtml(item.alt)}" /></figure>
    `).join("")}</div>`;
  }
  if (block.type === "image") {
    return `<figure class="article-image"><img src="${block.src}" alt="${escapeHtml(block.alt || "")}" /><figcaption>${escapeHtml(block.caption || block.alt || "")}</figcaption></figure>`;
  }
  if (block.type === "image-gallery") {
    return `<div class="article-gallery">${block.items.map((item) => `
      <figure class="article-image"><img src="${item.src}" alt="${escapeHtml(item.alt || "")}" /><figcaption>${escapeHtml(item.caption || item.alt || "")}</figcaption></figure>
    `).join("")}</div>`;
  }
  if (block.type === "equity") {
    return `<div class="inline-diagram equity-process"><div class="process-steps">${block.streets.map((street, index) => `
      <div><span>${index + 1}</span><strong>${escapeHtml(street[0])}</strong><small>${escapeHtml(street[1])} / ${escapeHtml(street[2])}</small></div>
    `).join("")}</div></div>`;
  }
  return "";
}

function renderAuth(mode) {
  const isLogin = mode === "login";
  app.innerHTML = `
    <section id="membership" class="auth-shell">
      <p class="eyebrow">${isLogin ? "Login" : "Invitation Signup"}</p>
      <h1>${isLogin ? "ログイン" : "招待コードで新規登録"}</h1>
      <p>${isLogin ? "登録済みのIDとパスワードで会員記事へ入れます。" : "招待コードを持っている人だけが登録できます。"}</p>
      <div class="security-note">
        <strong>${supabaseClient ? "会員管理" : "共有前の注意"}</strong>
        <span>${supabaseClient ? "ログイン情報と会員ステータスはSupabaseで管理されます。" : "現在のログインはテスト用の簡易実装です。大事なパスワードは使わず、本番運用ではSupabase Authなどの認証サービスに切り替えます。"}</span>
      </div>
      <form class="auth-form" id="authForm">
        <label>ログインID / メール<input name="email" type="email" autocomplete="email" required placeholder="you@example.com" /></label>
        <label>パスワード<input name="password" type="password" autocomplete="${isLogin ? "current-password" : "new-password"}" required minlength="6" placeholder="6文字以上" /></label>
        ${isLogin ? "" : '<label>招待コード<input name="invite" required placeholder="招待コードを入力" /></label>'}
        <button class="primary-button" type="submit">${isLogin ? "ログインする" : "登録する"}</button>
        <p class="form-message" id="formMessage"></p>
      </form>
      <p class="auth-switch">${isLogin ? '未登録なら <a href="#register">招待コードで登録</a>' : '登録済みなら <a href="#login">ログイン</a>'}</p>
    </section>
  `;

  document.querySelector("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    const message = document.querySelector("#formMessage");
    message.textContent = "";

    if (supabaseClient) {
      await handleSupabaseAuth({ isLogin, email, password, invite: String(form.get("invite") || "").trim().toUpperCase(), message });
      return;
    }

    const users = getUsers();

    if (isLogin) {
      const user = users.find((item) => item.email === email && item.password === password);
      if (!user) {
        message.textContent = "IDまたはパスワードが違います。";
        return;
      }
      setSession(user);
      location.hash = "#articles";
      return;
    }

    const invite = String(form.get("invite")).trim().toUpperCase();
    if (!INVITE_CODES.includes(invite)) {
      message.textContent = "招待コードが正しくありません。";
      return;
    }
    if (users.some((item) => item.email === email)) {
      message.textContent = "このIDはすでに登録されています。";
      return;
    }
    const user = { id: crypto.randomUUID(), email, password, invite, createdAt: new Date().toISOString() };
    users.push(user);
    saveUsers(users);
    setSession(user);
    location.hash = "#articles";
  });
}

async function handleSupabaseAuth({ isLogin, email, password, invite, message }) {
  if (isLogin) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      message.textContent = "IDまたはパスワードが違います。";
      return;
    }
    await claimPendingInvite(data.user);
    currentSession = await buildSupabaseSession(data.user);
    location.hash = "#articles";
    return;
  }

  if (!invite) {
    message.textContent = "招待コードを入力してください。";
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { data: { invite_code: invite } }
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  if (!data.session) {
    message.textContent = "確認メールを送信しました。メール確認後にログインしてください。";
    return;
  }

  const claimResult = await supabaseClient.rpc("claim_preflop_invite_code", { invite_code_input: invite });
  if (claimResult.error) {
    await supabaseClient.auth.signOut();
    currentSession = null;
    message.textContent = "招待コードが正しくないか、すでに使用されています。";
    return;
  }

  currentSession = await buildSupabaseSession(data.user);
  location.hash = "#articles";
}

async function claimPendingInvite(user) {
  const invite = String(user?.user_metadata?.invite_code || "").trim().toUpperCase();
  if (!invite) return;

  const profile = await fetchMemberProfile(user.id);
  if (profile && profile.membership_status !== "inactive") return;

  const { error } = await supabaseClient.rpc("claim_preflop_invite_code", { invite_code_input: invite });
  if (error) console.warn("Failed to claim pending invite", error);
}

function render() {
  renderHeader();
  const hash = location.hash || "#home";
  if (hash.startsWith("#article/")) renderArticle(hash.replace("#article/", ""));
  else if (hash === "#articles") app.innerHTML = renderArticleList();
  else if (hash === "#login") renderAuth("login");
  else if (hash === "#register" || hash === "#membership") renderAuth("register");
  else renderHome();

  wireRangeTool();
  wireArticleSearch();
  app.focus({ preventScroll: true });
}

async function init() {
  if (supabaseClient) {
    await loadSupabaseSession();
    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      currentSession = session ? await buildSupabaseSession(session.user) : null;
      authReady = true;
      render();
    });
  }

  window.addEventListener("hashchange", render);
  render();
}

init();
