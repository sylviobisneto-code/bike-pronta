
document.addEventListener("DOMContentLoaded", function () {

    /* ===== MENU MOBILE ===== */

    var header = document.getElementById("siteHeader");
    var menuToggle = document.getElementById("menuToggle");

    if (menuToggle && header) {
        menuToggle.addEventListener("click", function () {
            var isOpen = header.classList.toggle("menu-open");

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );
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
        if (!header) return;

        if (window.scrollY > 10) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    /* ===== STATUS ABERTO / FECHADO ===== */

    var statusBadge = document.getElementById("statusBadge");

    function atualizarStatus() {
        if (!statusBadge) return;

        var agora = new Date();
        var dia = agora.getDay();
        var hora = agora.getHours();

        // Segunda a sábado, das 9h às 18h.
        var diaUtil = dia >= 1 && dia <= 6;
        var dentroDoHorario = hora >= 9 && hora < 18;
        var aberto = diaUtil && dentroDoHorario;

        statusBadge.innerHTML = aberto
            ? '<span class="status-dot"></span> Aberto agora'
            : '<span class="status-dot"></span> Fechado agora';

        statusBadge.classList.toggle("open", aberto);
        statusBadge.classList.toggle("closed", !aberto);
    }

    if (statusBadge) {
        atualizarStatus();
        setInterval(atualizarStatus, 60000);
    }

    /* ===== BOTÃO VOLTAR AO TOPO ===== */

    var backToTop = document.getElementById("backToTop");

    if (backToTop) {
        window.addEventListener("scroll", function () {
            backToTop.classList.toggle("visible", window.scrollY > 500);
        });

        backToTop.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    /* ===== REVELAR SEÇÕES AO ROLAR ===== */

    var prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    var revealTargets = document.querySelectorAll(
        "section:not(.catalogo-grid):not(.catalogo-header), .box"
    );

    revealTargets.forEach(function (el) {
        el.setAttribute("data-reveal", "");
    });

    if (
        prefersReducedMotion ||
        !("IntersectionObserver" in window)
    ) {
        revealTargets.forEach(function (el) {
            el.classList.add("in-view");
        });
    } else {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        revealTargets.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ===== LIGHTBOX ===== */

    var lightbox = document.getElementById("lightbox");
    var lightboxImg = document.getElementById("lightboxImg");
    var lightboxClose = document.getElementById("lightboxClose");

    function abrirLightbox(src, alt) {
        if (!lightbox || !lightboxImg || !src) return;

        lightboxImg.src = src;
        lightboxImg.alt = alt || "";
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function fecharLightbox() {
        if (!lightbox) return;

        lightbox.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (lightbox && lightboxImg) {
        if (lightboxClose) {
            lightboxClose.addEventListener("click", fecharLightbox);
        }

        lightbox.addEventListener("click", function (e) {
            if (e.target === lightbox) {
                fecharLightbox();
            }
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                fecharLightbox();
            }
        });
    }

    /*
     * Delegação de eventos: também funciona com imagens
     * adicionadas dinamicamente pela API.
     */
    document.addEventListener("click", function (e) {
        var imagem = e.target.closest(".produto-img");

        if (!imagem || !lightbox || !lightboxImg) return;

        if (imagem.dataset.semImagem === "true") return;

        abrirLightbox(imagem.src, imagem.alt);
    });

    /* ===== CATÁLOGO DINÂMICO ===== */

    var catalogoGrid = document.querySelector(".catalogo-grid");

    if (catalogoGrid) {
        var caminho = window.location.pathname.toLowerCase();
        var categoria = null;

        if (caminho.includes("bicicletas-novas")) {
            categoria = "NOVA";
        } else if (caminho.includes("bicicletas-usadas")) {
            categoria = "USADA";
        } else if (caminho.includes("bicicletas-antigas")) {
            categoria = "ANTIGA";
        } else if (caminho.includes("bicicletas-infantis")) {
            categoria = "INFANTIL";
        }

        if (categoria) {
            carregarBicicletas(categoria);
        }
    }

    async function carregarBicicletas(categoria) {
        try {
            catalogoGrid.replaceChildren();

            var carregando = document.createElement("p");
            carregando.id = "mensagemCatalogo";
            carregando.textContent = "Carregando bicicletas...";
            catalogoGrid.appendChild(carregando);

            var resposta = await fetch(
                "http://localhost:8080/api/bicicletas?categoria=" +
                encodeURIComponent(categoria),
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    "Erro HTTP " + resposta.status +
                    " ao carregar as bicicletas."
                );
            }

            var bicicletas = await resposta.json();

            if (!Array.isArray(bicicletas)) {
                throw new Error("A API não retornou uma lista válida.");
            }

            catalogoGrid.replaceChildren();

            if (bicicletas.length === 0) {
                var vazio = document.createElement("p");
                vazio.id = "mensagemCatalogo";
                vazio.textContent =
                    "Nenhuma bicicleta cadastrada nesta categoria.";

                catalogoGrid.appendChild(vazio);
                return;
            }

            bicicletas.forEach(function (bike) {
                catalogoGrid.appendChild(
                    criarCardBicicleta(bike, categoria)
                );
            });

        } catch (erro) {
            console.error("Erro ao carregar bicicletas:", erro);

            catalogoGrid.replaceChildren();

            var aviso = document.createElement("p");
            aviso.id = "mensagemCatalogo";
            aviso.textContent =
                "Não foi possível carregar as bicicletas. " +
                "Confira se o backend está em execução.";

            catalogoGrid.appendChild(aviso);
        }
    }

    /* ===== CRIAR CARD DA BICICLETA ===== */

    function criarCardBicicleta(bike, categoria) {
        var card = document.createElement("article");
        card.className = "produto-card";

        var imagemWrap = document.createElement("div");
        imagemWrap.className = "produto-img-wrap";

        var imagem = document.createElement("img");
        imagem.className = "produto-img";
        imagem.alt = bike.nome || "Bicicleta";
        imagem.loading = "lazy";

        var caminhoImagem = String(bike.imagem || "").trim();

        if (caminhoImagem) {
            imagem.src = resolverCaminhoImagem(caminhoImagem);

            imagem.addEventListener("error", function () {
                imagem.dataset.semImagem = "true";
                imagem.remove();

                var avisoImagem = document.createElement("span");
                avisoImagem.className = "produto-sem-imagem";
                avisoImagem.textContent = "Imagem indisponível";

                imagemWrap.prepend(avisoImagem);
            }, { once: true });
        } else {
            imagem.dataset.semImagem = "true";

            var semImagem = document.createElement("span");
            semImagem.className = "produto-sem-imagem";
            semImagem.textContent = "Foto não cadastrada";

            imagemWrap.appendChild(semImagem);
        }

        var badge = document.createElement("span");
        badge.className = "produto-badge";

        var nomesCategorias = {
            NOVA: "Nova",
            USADA: "Usada",
            ANTIGA: "Clássica",
            INFANTIL: "Infantil"
        };

        badge.textContent = nomesCategorias[categoria] || "Bicicleta";

        imagemWrap.appendChild(badge);

        if (caminhoImagem) {
            imagemWrap.prepend(imagem);
        }

        var info = document.createElement("div");
        info.className = "produto-info";

        var nome = document.createElement("h3");
        nome.textContent = bike.nome || "Bicicleta";

        var descricao = document.createElement("p");
        descricao.className = "produto-detalhes";

        var detalhes = [
            bike.marca,
            bike.modelo,
            bike.tamanho,
            bike.tipo,
            bike.descricao
        ].filter(function (valor) {
            return valor !== null &&
                valor !== undefined &&
                String(valor).trim() !== "";
        });

        descricao.textContent = detalhes.length
            ? detalhes.join(" · ")
            : "Consulte os detalhes desta bicicleta pelo WhatsApp.";

        var preco = document.createElement("span");
        preco.className = "produto-preco";

        var valor = Number(bike.preco);

        preco.textContent =
            bike.preco !== null &&
            bike.preco !== undefined &&
            bike.preco !== "" &&
            Number.isFinite(valor)
                ? valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                })
                : "Consulte o preço";

        var consultar = document.createElement("a");
        consultar.className = "btn btn-whatsapp btn-small";
        consultar.target = "_blank";
        consultar.rel = "noopener noreferrer";

        var mensagem =
            "Olá! Tenho interesse na bicicleta " +
            (bike.nome || "") +
            ", no valor de " + preco.textContent +
            ". Gostaria de saber se ainda está disponível.";

        consultar.href =
            "https://wa.me/5521980244797?text=" +
            encodeURIComponent(mensagem);

        var icone = document.createElement("i");
        icone.className = "fa-brands fa-whatsapp";
        icone.setAttribute("aria-hidden", "true");

        consultar.append(
            icone,
            document.createTextNode(" Tenho interesse")
        );

        info.append(nome, descricao, preco, consultar);
        card.append(imagemWrap, info);

        return card;
    }

    /* ===== CAMINHO DAS IMAGENS ===== */

    function resolverCaminhoImagem(caminho) {
        var valor = String(caminho).trim();

        if (/^https?:\/\//i.test(valor)) {
            return valor;
        }

        if (valor.startsWith("/")) {
            return valor;
        }

        return "/bicicletas-usadas/" + valor;
    }

});
