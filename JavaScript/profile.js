// Profile Management
const ProfileManager = {
    // Get profile data
    getProfile: function() {
        return JSON.parse(localStorage.getItem('userProfile')) || {};
    },

    // Save profile data
    saveProfile: function(profileData) {
        localStorage.setItem('userProfile', JSON.stringify(profileData));
    },

    // Update profile picture
    updateProfilePicture: function(imageUrl) {
        const profile = this.getProfile();
        profile.imageUrl = imageUrl;
        this.saveProfile(profile);
        
        // Update UI
        document.querySelectorAll('#profileImage, .dropdown-header img').forEach(img => {
            img.src = imageUrl;
        });
    }
};

// Handle profile picture upload
document.getElementById('profilePictureInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            document.getElementById('profilePicturePreview').src = imageUrl;
            ProfileManager.updateProfilePicture(imageUrl);
        };
        reader.readAsDataURL(file);
    }
});

// Handle profile picture hover effect
const pictureContainer = document.querySelector('.profile-picture-container');
const pictureOverlay = document.querySelector('.profile-picture-overlay');

if (pictureContainer && pictureOverlay) {
    pictureContainer.addEventListener('mouseenter', () => {
        pictureOverlay.style.opacity = '1';
    });

    pictureContainer.addEventListener('mouseleave', () => {
        pictureOverlay.style.opacity = '0';
    });
}

// Handle form submission
document.getElementById('profileForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const profileData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        birthdate: document.getElementById('birthdate').value,
        gender: document.getElementById('gender').value,
        occupation: document.getElementById('occupation').value,
        location: document.getElementById('location').value,
        bio: document.getElementById('bio').value,
        linkedin: document.getElementById('linkedin').value,
        twitter: document.getElementById('twitter').value,
        imageUrl: document.getElementById('profilePicturePreview').src
    };

    // Save profile data
    ProfileManager.saveProfile(profileData);

    // Update UI elements
    document.getElementById('userName').textContent = `${profileData.firstName} ${profileData.lastName}`;
    document.getElementById('dropdownUserName').textContent = `${profileData.firstName} ${profileData.lastName}`;
    document.getElementById('dropdownUserEmail').textContent = profileData.email;

    // Show success message
    showNotification('Profile updated successfully!', 'success');
});

// Load existing profile data
document.addEventListener('DOMContentLoaded', function() {
    const profile = ProfileManager.getProfile();
    
    if (Object.keys(profile).length > 0) {
        // Fill form fields
        for (const [key, value] of Object.entries(profile)) {
            const element = document.getElementById(key);
            if (element) {
                element.value = value;
            }
        }

        // Update profile picture if exists
        if (profile.imageUrl) {
            document.getElementById('profilePicturePreview').src = profile.imageUrl;
            document.querySelectorAll('#profileImage, .dropdown-header img').forEach(img => {
                img.src = profile.imageUrl;
            });
        }

        // Update header
        if (profile.firstName && profile.lastName) {
            document.getElementById('userName').textContent = `${profile.firstName} ${profile.lastName}`;
            document.getElementById('dropdownUserName').textContent = `${profile.firstName} ${profile.lastName}`;
        }
        if (profile.email) {
            document.getElementById('dropdownUserEmail').textContent = profile.email;
        }
    }
}); 