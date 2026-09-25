document.addEventListener("DOMContentLoaded", () => {
    // 1. Funcionalidade para mostrar/esconder a senha
    const togglePasswordButtons = document.querySelectorAll(".toggle-password");
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Procura o input de senha que está no mesmo contentor
            const inputContainer = button.previousElementSibling;
            if (inputContainer && inputContainer.tagName === "INPUT") {
                const type = inputContainer.getAttribute("type") === "password" ? "text" : "password";
                inputContainer.setAttribute("type", type);
                
                // Altera o ícone visualmente (opcional)
                button.textContent = type === "password" ? "👁️" : "🙈";
            }
        });
    });

    // 2. Validação simples do formulário de registo
    const form = document.querySelector(".signup-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            // Verifica se a senha tem pelo menos 6 caracteres
            if (password.length < 6) {
                alert("A senha deve ter no mínimo 6 caracteres.");
                e.preventDefault();
                return;
            }

            // Verifica se as senhas coincidem
            if (password !== confirmPassword) {
                alert("As senhas não coincidem. Por favor, verifique.");
                e.preventDefault();
                return;
            }

            // Se tudo estiver correto (simulação de sucesso)
            // e.preventDefault(); // Comente esta linha se quiser que submeta de verdade
            alert("Conta criada com sucesso! Verifique o seu e-mail.");
        });
    }

    // 3. Interatividade dos botões de seleção de perfil (Organizador, Fornecedor, Admin)
    const roleButtons = document.querySelectorAll(".role-btn");
    roleButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            // Se o botão não for um link (<a>), remove e adiciona a classe active
            if (!btn.closest("a")) {
                roleButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            }
        });
    });
});