document.addEventListener("DOMContentLoaded", () => {
    // 1. Botão de Ajuda flutuante
    const helpButton = document.querySelector(".help-button") || document.querySelector(".fixed-help-btn");
    
    if (helpButton) {
        helpButton.addEventListener("click", () => {
            alert("Bem-estar e suporte TrocaTicket: Como podemos ajudar hoje? Entre em contacto connosco através do suporte.");
        });
    }

    // 2. Simulação de clique nos botões de exploração
    const btnExplore = document.querySelector(".btn-secondary");
    if (btnExplore) {
        btnExplore.addEventListener("click", (e) => {
            e.preventDefault();
            const eventsSection = document.querySelector(".featured-events-section");
            if (eventsSection) {
                eventsSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
});