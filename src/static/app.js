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

      activitiesList.innerHTML = "";

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants section
        const participantsSection = `
          <div class="participants-section" style="margin-top:1rem;background:#eef2ff;border-radius:6px;padding:0.75rem;">
            <h4 style="margin:0 0 0.5rem 0;font-size:1rem;color:#4338ca;">Participants</h4>
            <ul class="participants-list">
              ${
                details.participants.length > 0
                  ? details.participants.map(p => `
                      <li>
                        <span>${p}</span>
                        <button class="delete-participant" title="Remove participant" data-activity="${name}" data-email="${p}">&#128465;</button>
                      </li>
                    `).join("")
                  : '<li style="color:#888;">No participants yet</li>'
              }
            </ul>
          </div>
        `;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsSection}
        `;


        activitiesList.appendChild(activityCard);

        // Add delete event listeners for participants
        activityCard.querySelectorAll('.delete-participant').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const activityName = btn.getAttribute('data-activity');
            const email = btn.getAttribute('data-email');
            if (confirm(`Remove ${email} from ${activityName}?`)) {
              try {
                const res = await fetch(`/activities/${encodeURIComponent(activityName)}/unregister`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
                });
                if (!res.ok) {
                  const err = await res.json();
                  alert(err.detail || 'Failed to unregister participant.');
                } else {
                  fetchActivities();
                }
              } catch (err) {
                alert('Error unregistering participant.');
              }
            }
          });
        });

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
