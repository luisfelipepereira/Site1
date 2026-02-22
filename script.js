(function () {
  const CONFIG = {
    ga4MeasurementId: "G-XXXXXXXXXX",
    metaPixelId: "000000000000000",
  };

  function hasValidGa4Id(id) {
    return typeof id === "string" && /^G-[A-Z0-9]+$/i.test(id) && !id.includes("XXXXXXXXXX");
  }

  function hasValidPixelId(id) {
    return typeof id === "string" && /^[0-9]{8,20}$/.test(id) && id !== "000000000000000";
  }

  function initGa4(id) {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, { anonymize_ip: true });
  }

  function initMetaPixel(id) {
    if (window.fbq) {
      return;
    }
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", id);
    window.fbq("track", "PageView");
  }

  function trackEvent(name, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params || {});
    }
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", name, params || {});
    }
  }

  if (hasValidGa4Id(CONFIG.ga4MeasurementId)) {
    initGa4(CONFIG.ga4MeasurementId);
  }
  if (hasValidPixelId(CONFIG.metaPixelId)) {
    initMetaPixel(CONFIG.metaPixelId);
  }

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );
    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-track]").forEach((el) => {
    el.addEventListener("click", () => {
      const eventName = el.getAttribute("data-track");
      if (eventName) {
        trackEvent(eventName, { placement: el.tagName.toLowerCase() });
      }
    });
  });

  const params = new URLSearchParams(window.location.search);
  const utmSource = document.getElementById("utm_source");
  const utmMedium = document.getElementById("utm_medium");
  const utmCampaign = document.getElementById("utm_campaign");
  if (utmSource) utmSource.value = params.get("utm_source") || "";
  if (utmMedium) utmMedium.value = params.get("utm_medium") || "";
  if (utmCampaign) utmCampaign.value = params.get("utm_campaign") || "";

  const form = document.getElementById("lead-form");
  const feedback = document.getElementById("form-feedback");
  if (!form || !feedback) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    trackEvent("lead_form_submit_attempt");

    if (!form.checkValidity()) {
      feedback.textContent = "Preencha os campos obrigatorios para continuar.";
      feedback.style.color = "#b91c1c";
      trackEvent("lead_form_validation_error");
      return;
    }

    const honeypot = form.querySelector('input[name="empresa"]');
    if (honeypot && honeypot.value.trim() !== "") {
      return;
    }

    const endpoint = (form.getAttribute("data-endpoint") || "").trim();
    if (!endpoint || endpoint.includes("example.com")) {
      feedback.textContent = "Configure o endpoint real no atributo data-endpoint para receber leads.";
      feedback.style.color = "#b91c1c";
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      submitButton.textContent = "Enviando...";
    }

    const formData = new FormData(form);
    const payload = {
      nome: String(formData.get("nome") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      telefone: String(formData.get("telefone") || "").trim(),
      utm_source: String(formData.get("utm_source") || "").trim(),
      utm_medium: String(formData.get("utm_medium") || "").trim(),
      utm_campaign: String(formData.get("utm_campaign") || "").trim(),
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar lead");
      }

      feedback.textContent = "Recebemos seus dados. Em breve entraremos em contato.";
      feedback.style.color = "#166534";
      trackEvent("lead_form_submit_success", { channel: "landing_page" });
      form.reset();
    } catch (error) {
      feedback.textContent = "Nao foi possivel enviar agora. Tente novamente em instantes.";
      feedback.style.color = "#b91c1c";
      trackEvent("lead_form_submit_error");
    } finally {
      if (utmSource) utmSource.value = params.get("utm_source") || "";
      if (utmMedium) utmMedium.value = params.get("utm_medium") || "";
      if (utmCampaign) utmCampaign.value = params.get("utm_campaign") || "";
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.setAttribute("aria-busy", "false");
        submitButton.textContent = "Quero receber a proposta";
      }
    }
  });
})();
