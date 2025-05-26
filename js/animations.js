document.addEventListener('DOMContentLoaded', () => {
  // ============== INISIALISASI AOS ==============
  AOS.init({
    offset: 120,
    delay: 200,
    duration: 800,
    easing: 'ease',
    once: false
  });

  // ============== ANIMASI GSAP ==============
  // 1. ANIMASI FORM KONTAK
  const formInputs = document.querySelectorAll(".form-input");
  if (formInputs.length > 0) {
    formInputs.forEach(input => {
      input.addEventListener("focus", () => {
        gsap.to(input, { 
          scale: 1.02, 
          backgroundColor: "#3a3f54",
          duration: 0.3 
        });
      });
      input.addEventListener("blur", () => {
        gsap.to(input, { 
          scale: 1, 
          backgroundColor: "transparent",
          duration: 0.3 
        });
      });
    });
  }

  // 2. ANIMASI ICON SOSIAL MEDIA
  const socialIcons = document.querySelectorAll(".fa-whatsapp, .fa-instagram, .fa-facebook, .fa-linkedin, .fa-envelope, fa-map-marker-alt");
  if (socialIcons.length > 0) {
    socialIcons.forEach(icon => {
      icon.addEventListener("mouseenter", () => {
        gsap.to(icon, { 
          y: -5, 
          scale: 1.2,
          duration: 0.3 
        });
      });
      icon.addEventListener("mouseleave", () => {
        gsap.to(icon, { 
          y: 0, 
          scale: 1,
          duration: 0.3 
        });
      });
    });
  }
    
  // Efek menetik teks untuk elemen di luar modal
  const typingElements = document.querySelectorAll('.typing-effect:not(.modal .typing-effect)');
  typingElements.forEach(element => {
    initTypingEffect(element);
  });

  // Fungsi untuk membuka modal dengan GSAP
  function openModal(modal) {
    // Reset semua animasi sebelum memulai yang baru
    gsap.killTweensOf(modal.querySelectorAll('*'));
    
    // Animasi overlay modal (fade in)
    gsap.to(modal, {
      opacity: 1,
      display: "block",
      duration: 0.3,
      ease: "power2.out"
    });
  
    // Animasi konten modal (scale + fade)
    gsap.fromTo(modal.querySelector(".modal-content"),
    { scale: 0.8, opacity: 0 },
    { 
      scale: 1,
      opacity: 1,
      duration: 1,
      ease: "back.out(1.7)",
      onComplete: () => {
        animateModalElements(modal);
      }
    }
  );
        gsap.set(modal.querySelectorAll("*"), { opacity: 1 });
  }
  
  // Fungsi untuk animasi elemen dalam modal
  function animateModalElements(modal) {
    // Animasi bounce untuk judul
    gsap.fromTo(modal.querySelector("h2"),
      { y: -30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8, 
        ease: "bounce.out",
        // Pastikan opacity tetap 1 setelah animasi
        onComplete: () => {
          gsap.set(modal.querySelector("h2"), { opacity: 1 });
        }
      }
    );
    
    // Animasi untuk elemen dengan data-gsap
    const elements = modal.querySelectorAll("[data-gsap]");
    elements.forEach(el => {
      const type = el.getAttribute("data-gsap");
      const delay = parseFloat(el.getAttribute("data-delay")) || 0;
      
      if (type === "fade-right") {
        gsap.fromTo(el,
          { x: -20, opacity: 0 },
          { 
            x: 0, 
            opacity: 1, 
            delay: delay, 
            duration: 0.6, 
            ease: "power2.out",
            onComplete: () => {
              gsap.set(el, { opacity: 1 });
            }
          }
        );
      } else if (type === "fade-left") {
        gsap.fromTo(el,
          { x: 20, opacity: 0 },
          { 
            x: 0, 
            opacity: 1, 
            delay: delay, 
            duration: 0.6, 
            ease: "power2.out",
            onComplete: () => {
              gsap.set(el, { opacity: 1 });
            }
          }
        );
      } else if (type === "zoom-in") {
          gsap.fromTo(el,
            { scale: 0.0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              delay: delay, 
              duration: 0.9, 
              ease: "back.out(2.5)",
              onComplete: () => {
                gsap.set(el, { opacity: 1 });
              }
            }
          );
        } else if (type === "zoom-out") {
          gsap.fromTo(el,
            { scale: 1.2, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              delay: delay, 
              duration: 0.6, 
              ease: "power2.out",
              onComplete: () => {
                gsap.set(el, { opacity: 1 });
              }
            }
          );
      }

      
      // Jika elemen memiliki class typing-effect, jalankan efek ketik
      if (el.classList.contains('typing-effect')) {
        initTypingEffect(el);
      }
    });
  }
  
  // Fungsi untuk efek ketik
  function initTypingEffect(element) {
    // Periksa apakah perangkat adalah mobile
    if (window.innerWidth <= 768) {
        // Jika mobile, langsung tampilkan teks tanpa animasi
        element.textContent = element.getAttribute('data-original-text') || element.textContent;
        return;
    }

    const originalText = element.textContent;
    element.setAttribute('data-original-text', originalText); // Simpan teks asli
    element.textContent = '';
    element.classList.add('typing-in-progress');

    // Gunakan ScrollTrigger untuk memulai animasi saat elemen terlihat
    ScrollTrigger.create({
        trigger: element,
        start: "top 80%", // Mulai animasi ketika elemen 80% terlihat di viewport
        onEnter: () => {
            gsap.to(element, {
                duration: 2,
                text: originalText,
                ease: "power1.inOut",
                delay: 0.5,
                onComplete: () => {
                    element.classList.remove('typing-in-progress');
                }
            });
        },
        once: true // Pastikan animasi hanya berjalan sekali
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const typingElements = document.querySelectorAll('.typing-effect');

    typingElements.forEach(element => {
        // Nonaktifkan animasi jika perangkat adalah mobile
        if (window.innerWidth > 768) {
            initTypingEffect(element);
        } else {
            // Tampilkan teks langsung tanpa animasi
            element.textContent = element.getAttribute('data-original-text') || element.textContent;
        }
    });
  });
  
  // Fungsi untuk menutup modal
  function closeModal(modal) {
    // Hentikan semua animasi yang sedang berjalan
    gsap.killTweensOf(modal.querySelectorAll('*'));
    
    gsap.to(modal, {
      opacity: 0,
      display: "none",
      duration: 0.3,
      onComplete: () => {
        // Reset posisi dan opacity elemen setelah modal tertutup
        gsap.set(modal.querySelectorAll("*"), { 
          x: 0, 
          y: 0, 
          opacity: 0 
        });
      }
    });
  }
  
  // Event listener untuk tombol modal
  document.addEventListener("click", (e) => {
    // Buka modal
    if (e.target.matches("[data-modal]")) {
      const modalId = e.target.getAttribute("data-modal");
      const modal = document.getElementById(modalId);
      if (modal) openModal(modal);
    }
    
    // Tutup modal
    if (e.target.matches(".close")) {
      const modal = e.target.closest(".modal");
      if (modal) closeModal(modal);
    }
  });
  // 1. Staggered Grid Entrance Animation
  function initGridEntrance() {
    const gridItems = document.querySelectorAll('.image-con');
    
    if (gridItems.length > 0) {
      gsap.from(gridItems, {
        opacity: 0,
        y: 50,
        scale: 0.8,
        duration: 0.8,
        stagger: {
          amount: 0.6,
          from: "random"
        },
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: ".grid",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
    }
  }

  // 2. Hover Scale with Shadow Animation
  function initHoverEffects() {
    const imageHovers = document.querySelectorAll('.image-con img');
    
    imageHovers.forEach(img => {
      // Set initial state
      gsap.set(img, {
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
      });
      
      // Hover animation
      img.addEventListener('mouseenter', () => {
        gsap.to(img, {
          scale: 1.05,
          boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      // Mouse leave animation
      img.addEventListener('mouseleave', () => {
        gsap.to(img, {
          scale: 1,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });
  }

  // 3. Page Transition Animation
  function initPageTransitions() {
    // Before leaving the page
    document.addEventListener('click', (e) => {
      if (e.target.closest('a') && !e.target.closest('a').hasAttribute('target')) {
        const link = e.target.closest('a');
        const href = link.getAttribute('href');
        
        // Skip if it's a hash link
        if (href && href.startsWith('#')) return;
        
        e.preventDefault();
        
        // Out animation
        gsap.to('body', {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            window.location.href = href;
          }
        });
      }
    });
  
    // When page loads
    window.addEventListener('DOMContentLoaded', () => {
      gsap.from('body', {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      });
    });
  }

  // Panggil semua fungsi animasi
  document.addEventListener('DOMContentLoaded', () => {
    initGridEntrance();
    initHoverEffects();
    initPageTransitions();
  });
});