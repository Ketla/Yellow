document.addEventListener('DOMContentLoaded', function() {
  fetchTeamDetails();
});

async function fetchTeamDetails() {
  // Replace with your actual Bin ID and API key
  const binId = '65a7e70adc7465401894b78a';
  const apiKey = '$2a$10$lx.0aczVGbFUh6i4EKyM..Hu00fZbSaq528KFgAgZAxoav8D7Ddb.';

  try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
          method: 'GET',
          headers: {
              'X-Master-Key': apiKey
          }
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      displayLockedInTeam(data.record.teamYellow); // Assuming teamRed is an array
      document.getElementById('loading-message').style.display = 'none'; // Hide loading message
      document.getElementById('team-content').style.display = 'block'; // Show the rest of the content
  } catch (error) {
      console.error('Error fetching team details:', error);
      console.error('Error fetching team details:', error);
      document.getElementById('loading-message').textContent = 'Error loading team data.';
  }
}

function displayLockedInTeam(teamData) {
  const teamDetailsDiv = document.getElementById('team-details');
  teamDetailsDiv.innerHTML = ''; // Clear existing content

  // Create sections for each position
  const positions = ['Attacker', 'Defender', 'Goalkeeper'];
  const sections = {};

  positions.forEach(position => {
      const section = document.createElement('div');
      section.classList.add('team-section', position.toLowerCase());
      sections[position] = section; // Store the section for later use

      const title = document.createElement('h2');
      title.textContent = `${position}s:`; // e.g., "Attackers:"
      section.appendChild(title);

      teamDetailsDiv.appendChild(section);
  });

  // Add players to their respective sections
  teamData.forEach(user => {
      const nameSpan = document.createElement('span');
      nameSpan.classList.add(user.position.toLowerCase()); // Add position-based class for styling
      nameSpan.textContent = user.name;
      sections[user.position].appendChild(nameSpan); // Append to the correct section
  });
}

window.history.pushState(null, "", window.location.href); // Add a history state
window.onpopstate = function() {
    window.history.pushState(null, "", window.location.href); // Push it again when user attempts to go back
};
