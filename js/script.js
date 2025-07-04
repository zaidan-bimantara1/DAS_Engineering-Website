import emailjs from '@emailjs/browser';

    //=============================================
    // FUNGSI UNTUK MENANGANI MENU MOBILE PADA HEADER
    //=============================================
    window.toggleMobileMenu = function() {
        const header = document.getElementById('main-header');
        const dropdown = document.getElementById('mobile-dropdown');
        const arrow = document.getElementById('mobile-menu-arrow');
        
        dropdown.classList.toggle('show-dropdown');
        arrow.classList.toggle('rotate-arrow');
        
        const dropdownHeight = dropdown.offsetHeight;
        document.documentElement.style.setProperty('--dropdown-height', dropdownHeight + 'px');
        header.classList.toggle('expanded');
    };

    window.closeMobileMenu = function() {
        const header = document.getElementById('main-header');
        const dropdown = document.getElementById('mobile-dropdown');
        const arrow = document.getElementById('mobile-menu-arrow');
        
        dropdown.classList.remove('show-dropdown');
        arrow.classList.remove('rotate-arrow');
        header.classList.remove('expanded');
    };
    
    // =============================================
    // FUNGSI UTAMA UNTUK SIDEBAR (Dengan Null Check)
    // =============================================
    const initNavbar = () => {
        const navbarContainer = document.getElementById('navbar-container');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        
        if (!navbarContainer) return;
        
        // Load navbar content
        fetch('/page/navbar.html')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(data => {
                navbarContainer.innerHTML = data;
                
                // Initialize mobile menu toggle
                const mobileBtn = document.getElementById('mobile-menu-btn');
                if (mobileBtn) {
                    mobileBtn.addEventListener('click', () => {
                        document.getElementById('navbar-menu').classList.toggle('show');
                    });
                }
            })
            .catch(error => console.error('Error loading navbar:', error));
    };
    // =============================================
    // INISIALISASI SEMUA FUNGSI DENGAN ERROR HANDLING
    // =============================================
    try {
        initNavbar();
    } catch (e) {
        console.error('Initialization error:', e);
    }    
    // =============================================
    // FUNGSI UNTUK LOAD FOOTER
    // =============================================
    const loadFooter = () => {
        fetch("/page/footer.html")
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.text();
            })
            .then(data => {
                const footerContainer = document.getElementById("footer-container");
                if (footerContainer) {
                    footerContainer.innerHTML = data;
                }
            })
            .catch(error => console.error('Error loading footer:', error));
    };

    // =============================================
    // FUNGSI UNTUK PROFILE TABS (DIPERBAIKI)
    // =============================================
    const initProfileTabs = () => {
        console.log("Initializing profile tabs..."); // Debug
        
        const menuFounder = document.getElementById("menu-founder");
        const menuTeam = document.getElementById("menu-team");
        const menuFast = document.getElementById("menu-fast");
    
        const founderSection = document.getElementById("founder");
        const teamSection = document.getElementById("team");
        const fastSection = document.getElementById("fast");
    
        // Fungsi untuk menampilkan section berdasarkan hash URL
        const showSectionBasedOnHash = () => {
            const hash = window.location.hash;
            console.log("Current hash:", hash); // Debug
            
            // Sembunyikan semua section terlebih dahulu
            if (founderSection) founderSection.classList.add("hidden");
            if (teamSection) teamSection.classList.add("hidden");
            if (fastSection) fastSection.classList.add("hidden");
    
            // Tampilkan section sesuai hash
            if (hash === "#founder" && founderSection) {
                console.log("Showing founder section");
                founderSection.classList.remove("hidden");
            } else if (hash === "#team" && teamSection) {
                console.log("Showing team section");
                teamSection.classList.remove("hidden");
            } else if (fastSection) {
                console.log("Showing fast section (default)");
                fastSection.classList.remove("hidden"); // Default tampilkan fast
            }
        };
    
        // Jalankan saat pertama kali load
        showSectionBasedOnHash();
    
        // Tambahkan event listener untuk perubahan hash
        window.addEventListener('hashchange', showSectionBasedOnHash);
    
        // Event listeners untuk menu (dengan null check)
        if (menuFounder) {
            menuFounder.addEventListener("click", function(e) {
                e.preventDefault();
                window.location.hash = "founder";
                console.log("Founder menu clicked");
            });
        }
    
        if (menuTeam) {
            menuTeam.addEventListener("click", function(e) {
                e.preventDefault();
                window.location.hash = "team";
                console.log("Team menu clicked");
            });
        }
    
        if (menuFast) {
            menuFast.addEventListener("click", function(e) {
                e.preventDefault();
                window.location.hash = "fast";
                console.log("Fast menu clicked");
            });
        }
    };    

    // =============================================
    // FUNGSI SCROLL TO TOP (Dengan Null Check)
    // =============================================
    const initScrollToTop = () => {
        const scrollToTop = document.getElementById("scrollToTopBtn");
        if (!scrollToTop) return;

        window.addEventListener("scroll", function() {
            if (window.scrollY > 200) {
                scrollToTop.classList.remove("hidden");
            } else {
                scrollToTop.classList.add("hidden");
            }
        });

        scrollToTop.addEventListener("click", function() {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    };

    // =============================================
    // FUNGSI TAMBAHAN: LOAD PAGE (Dengan Error Handling)
    // =============================================
    const loadPage = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.querySelector('.content-container') || doc.body;
            
            if (!newContent) throw new Error('Content container not found in response');
            
            const currentContent = document.querySelector('.content-container');
            if (currentContent) {
                currentContent.innerHTML = newContent.innerHTML;
            }
            
            window.history.pushState({}, '', url);
            
            // Load footer setelah konten berubah
            loadFooter();
            
            // Re-init komponen dengan error handling
            try {
                initProfileTabs();
                initScrollToTop();
            } catch (e) {
                console.error('Error re-initializing components:', e);
            }
        } catch (error) {
            console.error('Error loading page:', error);
            window.location.href = url;
        }
    };
    // =============================================
    // INISIALISASI SEMUA FUNGSI DENGAN ERROR HANDLING
    // =============================================
    try {
        initNavbar();
        initProfileTabs();
        initScrollToTop();
        loadFooter();
    } catch (e) {
        console.error('Initialization error:', e);
    }

    // Handle popstate untuk SPA
    window.addEventListener('popstate', () => {
        try {
            loadPage(window.location.href);
        } catch (e) {
            console.error('Popstate error:', e);
        }
    });

    // =============================================
    // TRANSISI HALAMAN
    // =============================================
    const pageTransition = {
        duration: 0.1,
        ease: "power2.inOut",
        beforeEnter: (el) => {
          gsap.set(el, { opacity: 0, y: 20 });
        },
        enter: (el) => {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.5 });
        },
        leave: (el) => {
          gsap.to(el, { opacity: 0, y: -20, duration: 0.5 });
        }
      };
      
      // Gunakan ini saat berpindah halaman
      function navigate(url) {
        const mainContent = document.querySelector('.content-container');
        gsap.to(mainContent, {
          opacity: 0,
          y: 20,
          duration: 0.3,
          onComplete: () => {
            loadPage(url).then(() => {
              gsap.fromTo(mainContent, 
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.3 }
              );
            });
          }
        });
      }

      const initScrollProgress = () => {
        const progressBar = document.createElement('div');
        progressBar.style.position = 'fixed';
        progressBar.style.top = '0';
        progressBar.style.left = '0';
        progressBar.style.height = '4px';
        progressBar.style.backgroundColor = '#4f46e5';
        progressBar.style.zIndex = '1000';
        progressBar.style.width = '0%';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
            gsap.to(progressBar, {
            width: `${scrollPercent}%`,
            duration: 0.3,
            ease: "power1.out"
            });
        });
    };
    // =============================================
    // INISIALISASI emailjs
    // =============================================
    const form = document.getElementById('contactForm');
    if (form) {
      emailjs.init('N66-X-qpA4ZY6ctcM'); // Inisialisasi public key kamu di sini
  
      form.addEventListener('submit', function (e) {
        e.preventDefault();
  
        emailjs.sendForm('service_393qnot', 'template_auk0dki', this)
          .then(() => {
            alert('Pesan berhasil dikirim!');
            form.reset();
          }, (error) => {
            console.error('Gagal kirim EmailJS:', error);
            alert('Gagal mengirim pesan.');
          });
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initNavbar();
        initProfileTabs();
        initScrollToTop();
        loadFooter();
    });
// =============================================