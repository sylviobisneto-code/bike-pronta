document.addEventListener("DOMContentLoaded", function () {

    /* ===== MENU MOBILE ===== */
    var header = document.getElementById("siteHeader");
    var menuToggle = document.getElementById("menuToggle");

    if (menuToggle) {
        menuToggle.addEventListener("click", function () {
            var isOpen = header.classList.toggle("menu-open");
            menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        document.querySelectorAll(".mobile-nav a").forEach(function (link) {
            link.addEventListener("click", function () {
                header.classList.remove("menu-open");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ===== HEADER SOMBRA AO ROLAR ===== */
    window.addEventListener("scroll", function () {
        if (window.scrollY > 10) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    /* ===== STATUS ABERTO / FECHADO ===== */
    // Horário de funcionamento: Segunda a Sábado, 9h às 18h
    var statusBadge = document.getElementById("statusBadge");

    function atualizarStatus() {
        var agora = new Date();
        var dia = agora.getDay(); // 0 = domingo, 6 = sábado
        var hora = agora.getHours();

        var dentroDoHorario = hora >= 9 && hora < 18;
        var diaUtil = dia >= 1 && dia <= 6; // segunda a sábado
        var aberto = diaUtil && dentroDoHorario;

        if (aberto) {
            statusBadge.innerHTML = '<span class="status-dot"></span> Aberto agora';
            statusBadge.classList.add("open");
            statusBadge.classList.remove("closed");
        } else {
            statusBadge.innerHTML = '<span class="status-dot"></span> Fechado agora';
            statusBadge.classList.add("closed");
            statusBadge.classList.remove("open");
        }
    }

    if (statusBadge) {
        atualizarStatus();
        setInterval(atualizarStatus, 60000);
    }

    /* ===== BOTÃO VOLTAR AO TOPO ===== */
    var backToTop = document.getElementById("backToTop");

    if (backToTop) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 500) {
                backToTop.classList.add("visible");
            } else {
                backToTop.classList.remove("visible");
            }
        });

        backToTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ===== REVELAR SEÇÕES AO ROLAR ===== */
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var revealTargets = document.querySelectorAll("section, .box");

    revealTargets.forEach(function (el) {
        el.setAttribute("data-reveal", "");
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealTargets.forEach(function (el) { el.classList.add("in-view"); });
    } else {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealTargets.forEach(function (el) { observer.observe(el); });
    }

});