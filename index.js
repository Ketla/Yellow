let usersData; // Global variable to store user data

async function fetchUsersFromBin() {
  const binId = '65a7e70adc7465401894b78a'; // Your Bin ID
  const apiKey = '$2a$10$lx.0aczVGbFUh6i4EKyM..Hu00fZbSaq528KFgAgZAxoav8D7Ddb.'; // Your JSONBin.io API key

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

              // Check if the team is already locked
              if (data.record.isTeamLocked) {
                window.location.href = 'confirmation_page.html'; // Redirect to the confirmation page
                return; // Stop further execution
            }
    

      usersData = data.record.teamYellow; // Store the teamRed array
      displayUsers(usersData);
  } catch (error) {
      console.error('Fetching error:', error);
  }
}

function displayUsers(users) {
    const teamContainer = document.getElementById('team-container');
    teamContainer.innerHTML = ''; // Clear existing content

    users.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.classList.add('team-member');
        memberDiv.setAttribute('data-user-id', member.id); // Set user ID as a data attribute

        const roleSelect = document.createElement('select');
        ['Attacker', 'Defender', 'Goalkeeper'].forEach(role => {
            let option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            roleSelect.appendChild(option);
        });

        // Add event listener to each roleSelect dropdown
        roleSelect.addEventListener('change', updateTeamCompositionDisplay);

        memberDiv.innerHTML = `<span>${member.name}</span>`;
        memberDiv.appendChild(roleSelect);
        teamContainer.appendChild(memberDiv);
    });

    // Call once initially to set up the display
    updateTeamCompositionDisplay();
}

function updateTeamCompositionDisplay() {
    let attackers = [];
    let defenders = [];
    let goalkeeper = null;

    usersData.forEach(user => {
        const memberDiv = document.querySelector(`.team-member[data-user-id='${user.id}']`);
        if (memberDiv) {
            const selectedRole = memberDiv.querySelector('select').value;

            switch (selectedRole) {
                case 'Attacker':
                    attackers.push(user.name);
                    break;
                case 'Defender':
                    defenders.push(user.name);
                    break;
                case 'Goalkeeper':
                    if (goalkeeper) {
                        alert('Only one goalkeeper allowed!');
                        memberDiv.querySelector('select').value = ''; // Reset to no selection
                        return;
                    }
                    goalkeeper = user.name;
                    break;
            }
        }
    });

    // Update the display
    document.getElementById('attackers').innerHTML = attackers.map(name => `<span class="name attacker">${name}</span>`).join('');
    document.getElementById('defenders').innerHTML = defenders.map(name => `<span class="name defender">${name}</span>`).join('');
    document.getElementById('goalkeeper').innerHTML = goalkeeper ? `<span class="name goalkeeper">${goalkeeper}</span>` : '';
    document.getElementById('team-composition').style.display = 'block';
}



document.addEventListener('DOMContentLoaded', function() {
    fetchUsersFromBin(); // Fetch and display users
    const lockInButton = document.getElementById('lock-in-btn');
    lockInButton.addEventListener('click', assignPositions);
});

async function assignPositions() {
    let goalkeeperCount = 0;
    let defenderCount = 0;
    let attackerCount = 0;
    let unassignedCount = 0;

    // First, count the selected roles
    usersData.forEach(user => {
        const memberDiv = document.querySelector(`.team-member[data-user-id='${user.id}']`);
        if (memberDiv) {
            const selectedRole = memberDiv.querySelector('select').value;
            if (selectedRole === 'Goalkeeper') {
                goalkeeperCount++;
            } else if (selectedRole === 'Defender') {
                defenderCount++;
            } else if (selectedRole === 'Attacker') {
                attackerCount++;
            } else {
                unassignedCount++;
            }
        }
    });

    // Check if any users are unassigned
    if (unassignedCount > 0) {
        alert('Every player must be assigned a position');
        return;
    }

    // Check if the team composition meets the criteria
    if (goalkeeperCount !== 1) {
        alert('There must be exactly 1 goalkeeper');
        return;
    }
    if (defenderCount < 2) {
        alert('There must be at least 2 defenders');
        return;
    }
    if (attackerCount < 2) {
        alert('There must be at least 2 attackers');
        return;
    }

        // Confirmation dialog before locking in the team
        const confirmLockIn = confirm('Are you sure you want to lock in this team?');
        if (!confirmLockIn) {
            return; // If the user cancels, exit the function
        }

    // If criteria are met, proceed with updating the positions
    usersData.forEach(user => {
        const memberDiv = document.querySelector(`.team-member[data-user-id='${user.id}']`);
        if (memberDiv) {
            const selectedRole = memberDiv.querySelector('select').value;
            user.position = selectedRole; // Update position
        }
    });

    const updatedData = {
        teamYellow: usersData,
        isTeamLocked: true // Set the lock flag
    };


    // Now, send the updated data back to JSONBin.io
    try {
        await updateDataInJsonBin(updatedData);
        // Redirect to the confirmation page upon successful lock-in
        window.location.href = 'confirmation_page.html';
    } catch (error) {
        // Handle errors, for example, by alerting the user
        alert('There was an issue locking in the team. Please try again.');
    }
}



async function updateDataInJsonBin(updatedData) {
    const binId = '65a7e70adc7465401894b78a'; // Your Bin ID
    const apiKey = '$2a$10$lx.0aczVGbFUh6i4EKyM..Hu00fZbSaq528KFgAgZAxoav8D7Ddb.'; // Your JSONBin.io API key

    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            console.log('Data updated successfully');
            resolve(); // Resolve the promise on success
        } catch (error) {
            console.error('Error updating data:', error);
            reject(error); // Reject the promise on error
        }
    });
}

document.addEventListener('DOMContentLoaded', fetchUsersFromBin);