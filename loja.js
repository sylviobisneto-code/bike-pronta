document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       MENU MOBILE
    ========================================================= */

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

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });
    }


    /* =========================================================
       HEADER SOMBRA AO ROLAR
    ========================================================= */

    window.addEventListener("scroll", function () {

        if (!header) return;

        if (window.scrollY > 10) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    });


    /* =========================================================
       STATUS ABERTO / FECHADO
       Segunda a sábado - 09h às 18h
    ========================================================= */

    var statusBadge =
        document.getElementById("statusBadge");

    function atualizarStatus() {

        if (!statusBadge) return;

        var agora = new Date();

        var dia = agora.getDay();
        var hora = agora.getHours();

        var dentroDoHorario =
            hora >= 9 && hora < 18;

        var diaUtil =
            dia >= 1 && dia <= 6;

        var aberto =
            diaUtil && dentroDoHorario;


        if (aberto) {

            statusBadge.innerHTML =
                '<span class="status-dot"></span> Aberto agora';

            statusBadge.classList.add("open");

            statusBadge.classList.remove("closed");

        } else {

            statusBadge.innerHTML =
                '<span class="status-dot"></span> Fechado agora';

            statusBadge.classList.add("closed");

            statusBadge.classList.remove("open");

        }

    }


    if (statusBadge) {

        atualizarStatus();

        setInterval(atualizarStatus, 60000);

    }


    /* =========================================================
       BOTÃO VOLTAR AO TOPO
    ========================================================= */

    var backToTop =
        document.getElementById("backToTop");

    if (backToTop) {

        window.addEventListener("scroll", function () {

            if (window.scrollY > 500) {

                backToTop.classList.add("visible");

            } else {

                backToTop.classList.remove("visible");

            }

        });


        backToTop.addEventListener("click", function () {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }


    /* =========================================================
       REVELAR SEÇÕES AO ROLAR
    ========================================================= */

    var prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    var revealTargets =
        document.querySelectorAll(
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

        var observer =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(function (entry) {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "in-view"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.15
                }
            );


        revealTargets.forEach(function (el) {

            observer.observe(el);

        });

    }


    /* =========================================================
       LIGHTBOX
       Abrir foto do produto em tela cheia
    ========================================================= */

    var lightbox =
        document.getElementById("lightbox");

    var lightboxImg =
        document.getElementById("lightboxImg");

    var lightboxClose =
        document.getElementById("lightboxClose");

    var produtoImgs =
        document.querySelectorAll(".produto-img");


    function abrirLightbox(src, alt) {

        if (!lightbox || !lightboxImg) return;

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


    if (
        lightbox &&
        lightboxImg &&
        produtoImgs.length
    ) {

        produtoImgs.forEach(function (img) {

            img.addEventListener("click", function () {

                abrirLightbox(
                    img.getAttribute("src"),
                    img.getAttribute("alt")
                );

            });

        });


        if (lightboxClose) {

            lightboxClose.addEventListener(
                "click",
                fecharLightbox
            );

        }


        lightbox.addEventListener(
            "click",
            function (e) {

                if (e.target === lightbox) {

                    fecharLightbox();

                }

            }
        );


        document.addEventListener(
            "keydown",
            function (e) {

                if (e.key === "Escape") {

                    fecharLightbox();

                }

            }
        );

    }


    /* =========================================================
       AVALIAÇÕES DO GOOGLE
    ========================================================= */

    iniciarAvaliacoesGoogle();

});


/* =============================================================
   CONFIGURAÇÕES DO GOOGLE
============================================================= */

/*
    COLOQUE A CHAVE QUE VOCÊ CRIOU NO GOOGLE CLOUD
    ENTRE AS ASPAS ABAIXO.

    Exemplo:

    var GOOGLE_MAPS_API_KEY = "SUA_CHAVE";

*/

var GOOGLE_MAPS_API_KEY = "AIzaSyBNEk0M3B8X9Ag_nLTma88YI3piw1FZFdM";


/*
    Place ID da Bike Pronta JPA
*/

var GOOGLE_PLACE_ID =
    "ChIJA7IJ6GDZmwAR6wiaJPBbr28";


/* =============================================================
   INICIAR AVALIAÇÕES
============================================================= */

async function iniciarAvaliacoesGoogle() {

    var grid =
        document.getElementById("avaliacoesGrid");

    var nota =
        document.getElementById("avaliacoesNota");

    var estrelas =
        document.getElementById("avaliacoesEstrelas");

    var total =
        document.getElementById("avaliacoesTotal");


    if (!grid || !nota || !estrelas || !total) {
        return;
    }


    if (
        !GOOGLE_MAPS_API_KEY ||
        GOOGLE_MAPS_API_KEY ===
        "COLOQUE_AQUI_A_CHAVE_QUE_VOCE_CRIou"
    ) {

        console.warn(
            "Google Maps: API Key ainda não configurada."
        );

        total.textContent =
            "Configure a integração com o Google.";

        return;

    }


    try {

        /*
            Carrega a Google Maps JavaScript API
        */

        await carregarGoogleMaps();


        /*
            Importa a biblioteca Places
        */

        var placesLibrary =
            await google.maps.importLibrary("places");


        var Place =
            placesLibrary.Place;


        /*
            Cria o estabelecimento
        */

        var place =
            new Place({
                id: GOOGLE_PLACE_ID
            });


        /*
            Busca os campos necessários
        */

        await place.fetchFields({

            fields: [
                "displayName",
                "rating",
                "userRatingCount",
                "reviews"
            ]

        });


        /* =====================================================
           NOTA GERAL
        ===================================================== */

        var rating =
            typeof place.rating === "number"
                ? place.rating
                : 0;


        nota.textContent =
            rating
                .toFixed(1)
                .replace(".", ",");


        /* =====================================================
           ESTRELAS GERAIS
        ===================================================== */

        estrelas.innerHTML =
            gerarEstrelas(rating);


        /* =====================================================
           TOTAL DE AVALIAÇÕES
        ===================================================== */

        var quantidade =
            place.userRatingCount || 0;


        total.textContent =
            "baseado em " +
            quantidade +
            " avaliações no Google";


        /* =====================================================
           AVALIAÇÕES
        ===================================================== */

        renderizarAvaliacoes(
            place.reviews || [],
            grid
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar avaliações do Google:",
            erro
        );


        total.textContent =
            "Não foi possível carregar as avaliações.";


        grid.innerHTML = `
            <div class="avaliacao-card">

                <div class="avaliacao-estrelas">
                    ★★★★★
                </div>

                <p class="avaliacao-texto">
                    As avaliações do Google
                    estão temporariamente indisponíveis.
                </p>

                <span class="avaliacao-autor">
                    Consulte todas as avaliações no Google.
                </span>

            </div>
        `;

    }

}


/* =============================================================
   CARREGAR GOOGLE MAPS JAVASCRIPT API
============================================================= */

function carregarGoogleMaps() {

    return new Promise(function (resolve, reject) {

        /*
            Se já estiver carregado,
            não carrega novamente.
        */

        if (
            window.google &&
            window.google.maps
        ) {

            resolve();

            return;

        }


        /*
            Cria o script
        */

        var script =
            document.createElement("script");


        script.src =
            "https://maps.googleapis.com/maps/api/js" +
            "?key=" +
            encodeURIComponent(
                GOOGLE_MAPS_API_KEY
            ) +
            "&v=weekly";


        script.async = true;

        script.defer = true;


        script.onload = function () {

            resolve();

        };


        script.onerror = function () {

            reject(
                new Error(
                    "Não foi possível carregar a Google Maps JavaScript API."
                )
            );

        };


        document.head.appendChild(script);

    });

}


/* =============================================================
   RENDERIZAR AVALIAÇÕES
============================================================= */

function renderizarAvaliacoes(
    reviews,
    grid
) {

    /*
        Limpa o carregamento inicial
    */

    grid.innerHTML = "";


    /*
        Mantém somente 3 avaliações no site.
        O Google pode retornar até 5.
    */

    var avaliacoes =
        reviews.slice(0, 3);


    /*
        Nenhuma avaliação encontrada
    */

    if (avaliacoes.length === 0) {

        grid.innerHTML = `
            <div class="avaliacao-card">

                <div class="avaliacao-estrelas">
                    ★★★★★
                </div>

                <p class="avaliacao-texto">
                    Ainda não foi possível encontrar
                    avaliações para este estabelecimento.
                </p>

            </div>
        `;

        return;

    }


    /*
        Cria os cards
    */

    avaliacoes.forEach(function (review) {

        var card =
            document.createElement("div");

        card.className =
            "avaliacao-card";


        /* Nota */

        var rating =
            review.rating || 0;


        /* Texto */

        var texto =
            review.text &&
            review.text.text
                ? review.text.text
                : "Avaliação sem comentário.";


        /* Autor */

        var autor =
            review.authorAttribution &&
            review.authorAttribution.displayName
                ? review.authorAttribution.displayName
                : "Cliente Google";


        /*
            Estrelas
        */

        var estrelasReview =
            document.createElement("div");

        estrelasReview.className =
            "avaliacao-estrelas";

        estrelasReview.innerHTML =
            gerarEstrelas(rating);


        /*
            Texto da avaliação
        */

        var textoReview =
            document.createElement("p");

        textoReview.className =
            "avaliacao-texto";

        textoReview.textContent =
            '"' + texto + '"';


        /*
            Autor
        */

        var autorReview =
            document.createElement("span");

        autorReview.className =
            "avaliacao-autor";

        autorReview.textContent =
            "— " + autor;


        /*
            Monta o card
        */

        card.appendChild(
            estrelasReview
        );

        card.appendChild(
            textoReview
        );

        card.appendChild(
            autorReview
        );


        /*
            Adiciona na página
        */

        grid.appendChild(card);

    });

}


/* =============================================================
   GERAR ESTRELAS
============================================================= */

function gerarEstrelas(rating) {

    var estrelas = "";

    var quantidade =
        Math.round(rating);


    for (var i = 1; i <= 5; i++) {

        if (i <= quantidade) {

            estrelas += "★";

        } else {

            estrelas += "☆";

        }

    }


    return estrelas;

}