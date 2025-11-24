document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Cria a lista de participantes com ícone de deletar
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participantes:</strong>
              <ul class="participants-list">
                ${details.participants.map(p => `
                  <li>
                    <span class="participant-email">${p}</span>
                    <button class="delete-participant-btn" title="Remover participante" data-activity="${name}" data-email="${p}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="#c62828" d="M7 21q-.825 0-1.413-.588Q5 19.825 5 19V7H4V5h5V4h6v1h5v2h-1v12q0 .825-.587 1.412Q17.825 21 17 21Zm10-14H7v12q0 .425.288.712Q7.575 20 8 20h8q.425 0 .713-.288Q17 19.425 17 19Zm-5 8q-.425 0-.712-.288Q11 14.425 11 14V10q0-.425.288-.712Q11.575 9 12 9t.713.288Q13 9.575 13 10v4q0 .425-.287.712Q12.425 15 12 15Zm-3 0q-.425 0-.712-.288Q8 14.425 8 14V10q0-.425.288-.712Q8.575 9 9 9t.713.288Q10 9.575 10 10v4q0 .425-.287.712Q9.425 15 9 15Zm6 0q-.425 0-.712-.288Q14 14.425 14 14V10q0-.425.288-.712Q14.575 9 15 9t.713.288Q16 9.575 16 10v4q0 .425-.287.712Q15.425 15 15 15Z"/></svg>
                    </button>
                  </li>
                `).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participantes:</strong>
              <span class="no-participants">Nenhum participante inscrito ainda.</span>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;


        activitiesList.appendChild(activityCard);

        // Adiciona listeners aos botões de deletar participantes
        setTimeout(() => {
          const deleteBtns = activityCard.querySelectorAll('.delete-participant-btn');
          deleteBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const activity = btn.getAttribute('data-activity');
              const email = btn.getAttribute('data-email');
              if (confirm(`Tem certeza que deseja remover ${email} de ${activity}?`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(activity)}/participants/${encodeURIComponent(email)}`, {
                    method: 'DELETE'
                  });
                  if (response.ok) {
                    // Atualiza a lista de atividades
                    fetchActivities();
                  } else {
                    alert('Erro ao remover participante.');
                  }
                } catch (err) {
                  alert('Erro de conexão ao remover participante.');
                }
              }
            });
          });
        }, 0);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Atualiza a lista de atividades/participantes após cadastro
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
