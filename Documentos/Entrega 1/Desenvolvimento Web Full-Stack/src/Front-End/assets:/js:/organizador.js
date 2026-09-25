document.addEventListener("DOMContentLoaded", () => {
    // 1. Filtros de abas (Todos, Em andamento, Concluídos)
    const tabs = document.querySelectorAll(".filter-tabs .tab");
    const eventCards = document.querySelectorAll(".events-list .event-card");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove a classe active de todas as abas e adiciona na clicada
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const filterText = tab.textContent.trim().toLowerCase();

            // Lógica para filtrar os cartões de eventos com base no texto da aba
            eventCards.forEach(card => {
                const badge = card.querySelector(".badge").textContent.toLowerCase();

                if (filterText.includes("todos")) {
                    card.style.display = "flex";
                } else if (filterText.includes("em andamento") && badge.includes("em andamento")) {
                    card.style.display = "flex";
                } else if (filterText.includes("concluídos") && badge.includes("concluído")) {
                    card.style.display = "flex";
                } else {
                    // Se não corresponder ao filtro, oculta o cartão
                    // (Pode ajustar as condições dependendo de como rotulou os badges)
                    card.style.display = filterText.includes("todos") ? "flex" : "none";
                }
            });
        });
    });

    // 2. Barra de Pesquisa Dinâmica
    const searchInput = document.querySelector(".search-box input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();

            eventCards.forEach(card => {
                const title = card.querySelector("h3").textContent.toLowerCase();
                const location = card.querySelector(".event-details").textContent.toLowerCase();

                if (title.includes(searchTerm) || location.includes(searchTerm)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // 3. Botão de Criar Evento
    const btnCreateEvent = document.querySelector(".page-header .btn-primary");
    if (btnCreateEvent) {
        btnCreateEvent.addEventListener("click", () => {
            alert("Abrir modal ou formulário para criação de um novo evento.");
        });
    }
});