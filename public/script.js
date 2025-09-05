document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll to section on nav link click
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Predict button functionality
    const predictButton = document.querySelector('.predict-btn');
    predictButton.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Welcome! Your college prediction journey is about to begin. Please contact us for more information.');
    });

    // --- College Modal Functionality ---
    const colleges = {
        'coep': {
            name: 'College of Engineering, Pune (COEP)',
            description: 'COEP is an autonomous engineering college affiliated with Savitribai Phule Pune University. It is one of the oldest engineering colleges in Asia, established in 1854. It is known for its excellent academics, strong alumni network, and vibrant campus life.',
            link: 'http://www.coep.org.in/',
            image: 'https://upload.wikimedia.org/wikipedia/commons/3/36/COEP_Main_building.JPG',
            details: [
                '**Average Placement:** ₹10 LPA',
                '**Popular Branches:** Computer Engineering, Mechanical Engineering, E&TC',
                '**MHT-CET Cutoff:** 99.9+ percentile'
            ]
        },
        'pict': {
            name: 'Pune Institute of Computer Technology (PICT), Pune',
            description: 'PICT is a private engineering college located in Pune, a hub for IT companies. The college is known for its strong focus on Computer Science and IT and has a reputation for excellent placements.',
            link: 'https://www.pict.edu/',
            image: 'https://pict.edu/wp-content/uploads/2019/07/pict_campus_2.jpg',
            details: [
                '**Average Placement:** ₹7-9 LPA',
                '**Popular Branches:** Computer Engineering, Information Technology, E&TC',
                '**MHT-CET Cutoff:** 99.3+ percentile'
            ]
        },
        'vit': {
            name: 'Vishwakarma Institute of Technology (VIT), Pune',
            description: 'VIT is an autonomous institute affiliated with Savitribai Phule Pune University. It is a highly-ranked private college known for its quality education, good infrastructure, and strong industry connections.',
            link: 'https://www.vit.edu/',
            image: 'https://vit.edu/wp-content/uploads/2021/04/campus_3.jpg',
            details: [
                '**Average Placement:** ₹6-8 LPA',
                '**Popular Branches:** Computer Engineering, E&TC, AI & Data Science',
                '**MHT-CET Cutoff:** 97.5+ percentile'
            ]
        },
        'aissms': {
            name: 'AISSMS College of Engineering (AISSMS COE)',
            description: 'AISSMS COE is a well-known private engineering college in Pune. It offers a vibrant campus life and a variety of engineering disciplines, with good placement records.',
            link: 'https://www.aissmscoe.com/',
            image: 'https://www.aissmscoe.com/wp-content/uploads/2019/04/AISSMS-COE-1.jpg',
            details: [
                '**Average Placement:** ₹4-6 LPA',
                '**Popular Branches:** Computer Engineering, Mechanical Engineering, Civil Engineering',
                '**MHT-CET Cutoff:** 95.0+ percentile'
            ]
        },
        'dypatil': {
            name: 'Dr. D. Y. Patil Institute of Technology (DY Patil COE)',
            description: 'DY Patil COE is part of the well-established D. Y. Patil group. It is located in Pune and is known for its modern infrastructure, a wide range of courses, and a focus on both academics and extracurriculars.',
            link: 'https://dypit.ac.in/',
            image: 'https://dypatiluniversitypune.edu.in/wp-content/uploads/2022/10/campus-1.jpg',
            details: [
                '**Average Placement:** ₹4-5 LPA',
                '**Popular Branches:** Computer Engineering, IT, Mechanical Engineering',
                '**MHT-CET Cutoff:** 93.0+ percentile'
            ]
        }
    };

    const modalOverlay = document.querySelector('.modal-overlay');
    const modalImage = document.querySelector('.modal-image');
    const modalName = document.getElementById('modal-college-name');
    const modalDescription = document.getElementById('modal-college-description');
    const modalDetails = document.querySelector('.modal-info .info-details');
    const modalLink = document.getElementById('modal-college-link');
    const closeButton = document.querySelector('.close-button');
    const collegeCards = document.querySelectorAll('.category-card');
    const contactForm = document.getElementById('contactForm');


    const showModal = (collegeKey) => {
        const college = colleges[collegeKey];
        if (college) {
            modalImage.src = college.image;
            modalName.textContent = college.name;
            modalDescription.textContent = college.description;
            modalLink.href = college.link;

            modalDetails.innerHTML = '';
            college.details.forEach(detail => {
                const li = document.createElement('li');
                li.innerHTML = detail;
                modalDetails.appendChild(li);
            });

            modalOverlay.style.display = 'flex';
            setTimeout(() => modalOverlay.classList.add('active'), 10);
        }
    };

    const hideModal = () => {
        modalOverlay.classList.remove('active');
        setTimeout(() => modalOverlay.style.display = 'none', 300);
    };

    collegeCards.forEach(card => {
        card.addEventListener('click', () => {
            const collegeKey = card.getAttribute('data-college');
            showModal(collegeKey);
        });
    });

    closeButton.addEventListener('click', hideModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            hideModal();
        }
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you shortly.');
        contactForm.reset();
    });

    // --- Counter Animation ---
    const counters = document.querySelectorAll('.stat-item .number');
    const speed = 200; // The lower the number, the faster the counter

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const updateCount = () => {
            const increment = target / speed;
            if (count < target) {
                count += increment;
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Trigger when 50% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target.querySelector('.number');
                animateCounter(counter);
                observer.unobserve(entry.target); // Stop observing after animation
            }
        });
    }, observerOptions);

    document.querySelectorAll('.stat-item').forEach(stat => {
        observer.observe(stat);
    });

    // --- Dark Mode Toggle ---
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    });
});