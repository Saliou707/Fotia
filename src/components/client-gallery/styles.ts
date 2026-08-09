/**
 * Feuille de style de la vue client — centralisée ici car elle dépend de
 * valeurs dynamiques (fond du hero, avatar du photographe) injectées via
 * template literals. Les composants extraits consomment cette fonction.
 */
export function galleryStyles(heroBgUrl: string, avatarUrl: string | null): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');
    
    .premium-gallery-container {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #080808;
      color: #F2EDE4;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .hero-banner {
      position: relative;
      height: 75vh;
      min-height: 500px;
      max-height: 800px;
      display: flex;
      align-items: flex-end;
      background-color: #080808;
      background-image: ${heroBgUrl ? `url(${heroBgUrl})` : 'radial-gradient(circle at top right, #1a1a1a, #080808)'};
      background-size: cover;
      background-position: center;
      padding: 60px 4% 80px;
      box-sizing: border-box;
    }

    .hero-banner::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(8, 8, 8, 0.3) 0%, rgba(8, 8, 8, 0.1) 40%, rgba(8, 8, 8, 0.75) 75%, #080808 100%);
      z-index: 1;
    }

    .hero-banner::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.2);
      z-index: 0;
    }

    .hero-nav {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 88px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 4%;
      z-index: 10;
      background: linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%);
    }

    .hero-logo-box {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      position: relative;
    }

    .hero-logo-glow {
      position: absolute;
      inset: -14px;
      border-radius: 20px;
      background: radial-gradient(ellipse, rgba(223,84,56,0.22) 0%, transparent 70%);
      filter: blur(12px);
      pointer-events: none;
    }

    .hero-nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .hero-nav-btn {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: #F2EDE4;
      border-radius: 99px;
      padding: 9px 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .hero-nav-btn:hover {
      background: rgba(255, 255, 255, 0.13);
      border-color: rgba(255, 255, 255, 0.22);
      transform: translateY(-1px);
    }

    .hero-content {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 800px;
      margin-bottom: 10px;
    }

    .photographer-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 6px 14px 6px 6px;
      border-radius: 99px;
      margin-bottom: 24px;
    }

    .photographer-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg, #C8482E, #A4351F)'};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #FFF;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }

    .photographer-meta {
      text-align: left;
    }

    .photographer-meta-name {
      font-size: 13px;
      font-weight: 700;
      color: #F2EDE4;
      line-height: 1.2;
    }

    .photographer-meta-role {
      font-size: 10px;
      color: #A09890;
      font-weight: 500;
    }

    .hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(34px, 5.5vw, 60px);
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #FFFFFF;
      margin: 0 0 16px;
      line-height: 1.1;
      text-shadow: 0 2px 20px rgba(0,0,0,0.4);
    }

    .hero-title span {
      color: #C8482E;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 400;
      margin-left: 8px;
    }

    .hero-desc {
      font-size: clamp(14px, 1.8vw, 16.5px);
      color: #A09890;
      line-height: 1.6;
      margin: 0 0 28px;
      font-weight: 400;
      max-width: 620px;
      text-shadow: 0 1px 10px rgba(0,0,0,0.3);
    }

    .hero-badges-row {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }

    .hero-badge-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #A09890;
      font-weight: 500;
    }

    .hero-actions-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .hero-primary-btn {
      background: linear-gradient(135deg, #DF5438 0%, #C8482E 60%, #A4351F 100%);
      color: #FFF;
      border: none;
      font-weight: 700;
      font-size: 14px;
      border-radius: 99px;
      padding: 13px 28px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 28px rgba(200, 72, 46, 0.45);
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .hero-primary-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%);
      pointer-events: none;
    }

    .hero-primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 36px rgba(200, 72, 46, 0.6);
    }

    .hero-secondary-btn {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #FFF;
      font-weight: 700;
      font-size: 14px;
      border-radius: 99px;
      padding: 13px 26px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transition: all 0.25s ease;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .hero-secondary-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.28);
      transform: translateY(-2px);
    }

    /* Main Content Grid */
    .main-gallery-section {
      padding: 60px 4% 140px;
      max-width: 1440px;
      margin: 0 auto;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 36px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 20px;
    }

    .section-title {
      font-size: 22px;
      font-weight: 800;
      color: #FFF;
      letter-spacing: -0.02em;
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .control-pill {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      color: #A09890;
      padding: 8px 18px;
      border-radius: 99px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .control-pill:hover {
      background: rgba(255,255,255,0.06);
      color: #FFF;
      border-color: rgba(255,255,255,0.12);
    }

    /* Image Grid Styles */
    .photo-grid-premium {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 24px;
    }

    .photo-card-premium {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      aspect-ratio: 3/2;
      cursor: pointer;
      background: rgba(255,255,255,0.01);
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      border: 1px solid rgba(255, 255, 255, 0.03);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .photo-card-premium:hover {
      transform: translateY(-4px) scale(1.01);
      border-color: rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .photo-card-premium:hover .photo-img {
      transform: scale(1.05);
    }

    .photo-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(8,8,8,0.7) 0%, rgba(8,8,8,0.1) 50%, rgba(8,8,8,0.4) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16px;
      box-sizing: border-box;
      z-index: 1;
    }

    .photo-card-premium:hover .photo-overlay {
      opacity: 1;
    }

    .photo-card-heart-btn {
      align-self: flex-end;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(8, 8, 8, 0.55);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.12);
      color: #FFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .photo-card-heart-btn:hover {
      background: #C8482E;
      border-color: #C8482E;
      transform: scale(1.1);
    }

    .photo-card-heart-btn.active {
      background: #C8482E;
      border-color: #C8482E;
      color: #FFF;
    }

    .photo-card-meta-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .photo-download-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      border: none;
      color: #FFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .photo-download-btn:hover {
      background: #FFF;
      color: #080808;
      transform: scale(1.1);
    }

    .photo-heart-indicator {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #C8482E;
      color: #FFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(200,72,46,0.35);
      z-index: 2;
    }

    /* Sticky bottom action bar styling */
    .sticky-bar-premium {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 580px;
      background: rgba(17, 17, 17, 0.7);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      border-radius: 100px;
      padding: 10px 12px 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      z-index: 50;
    }

    .sticky-bar-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .sticky-bar-label {
      font-size: 14px;
      font-weight: 700;
      color: #FFF;
    }

    .sticky-bar-sub {
      font-size: 11px;
      color: #A09890;
      margin-top: 1px;
    }

    .sticky-bar-btn {
      background: #C8482E;
      color: #FFF;
      border: none;
      font-weight: 700;
      font-size: 13px;
      border-radius: 99px;
      padding: 12px 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 15px rgba(200,72,46,0.3);
      transition: all 0.2s;
      white-space: nowrap;
    }

    .sticky-bar-btn:hover {
      background: #DF5438;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(200,72,46,0.4);
    }

    @media (max-width: 640px) {
      .main-gallery-section {
        padding: 24px 12px 120px !important;
      }
      .photo-grid-premium {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px !important;
      }
      .photo-card-premium {
        border-radius: 10px !important;
        aspect-ratio: 3/4 !important;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
      }
      .photo-overlay {
        opacity: 1 !important;
        background: linear-gradient(to top, rgba(8,8,8,0.75) 0%, transparent 40%) !important;
        padding: 20px !important;
      }
      .photo-card-heart-btn {
        width: 48px !important;
        height: 48px !important;
      }
      .photo-card-heart-btn svg {
        width: 22px !important;
        height: 22px !important;
      }
      .photo-download-btn {
        width: 48px !important;
        height: 48px !important;
      }
      .photo-download-btn svg {
        width: 22px !important;
        height: 22px !important;
      }

      /* Hero banner mobile height override */
      .hero-banner {
        height: 55vh !important;
        min-height: 420px !important;
        padding: 40px 4% 30px !important;
      }
      .hero-title {
        font-size: 32px !important;
        margin-bottom: 8px !important;
      }
      .hero-desc {
        font-size: 14px !important;
        margin-bottom: 24px !important;
        line-height: 1.5 !important;
      }
      .hero-badges-row {
        margin-bottom: 22px !important;
        gap: 16px !important;
      }

      /* Bottom sticky controls for mobile devices */
      .sticky-bar-premium {
        bottom: 16px !important;
        width: 94% !important;
        padding: 8px 8px 8px 16px !important;
        border-radius: 99px !important;
      }
      .sticky-bar-info {
        gap: 8px !important;
      }
      .sticky-bar-label {
        font-size: 12.5px !important;
      }
      .sticky-bar-sub {
        display: none !important;
      }
      .sticky-bar-btn {
        padding: 10px 16px !important;
        font-size: 12px !important;
      }
    }

    @media (max-width: 768px) {
      .lightbox-nav-btn {
        display: none !important;
      }
    }

    /* ── Fullscreen Lightbox ── */
    .lightbox-fullscreen {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: #000;
      display: flex;
      flex-direction: column;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
      overscroll-behavior: none;
    }

    .lightbox-topbar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 210;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      padding-top: max(16px, env(safe-area-inset-top, 16px));
      background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
    }

    .lightbox-counter {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    .lightbox-topbar-actions {
      display: flex;
      gap: 8px;
    }

    .lightbox-icon-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.1);
      color: #FFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }

    .lightbox-icon-btn:active {
      transform: scale(0.92);
    }

    .lightbox-icon-btn.fav-active {
      background: #C8482E;
      border-color: #C8482E;
    }

    .lightbox-image-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }

    .lightbox-slide-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      will-change: transform;
    }

    .lightbox-slide-container img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      pointer-events: none;
      -webkit-user-drag: none;
    }

    .lightbox-desktop-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 211;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(18,18,18,0.5);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.08);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .lightbox-desktop-nav:hover {
      background: #C8482E;
      border-color: #C8482E;
    }

    .lightbox-desktop-nav.prev { left: 20px; }
    .lightbox-desktop-nav.next { right: 20px; }

    @media (max-width: 768px) {
      .lightbox-desktop-nav {
        display: none !important;
      }
    }

    /* ── Share Modal ── */
    .share-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .share-modal-card {
      background: #151515;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 28px;
      padding: 32px 24px 24px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .share-modal-title {
      font-size: 22px;
      font-weight: 700;
      color: #FFF;
      margin-bottom: 8px;
      text-align: center;
      letter-spacing: -0.02em;
    }

    .share-modal-desc {
      font-size: 14px;
      color: #A09890;
      text-align: center;
      margin-bottom: 28px;
      line-height: 1.5;
    }
    
    .share-option-btn {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .share-option-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0,0,0,0.25);
    }
    
    .share-option-btn:active {
      transform: translateY(0);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); scale: 0.95; }
      to { opacity: 1; transform: translateY(0); scale: 1; }
    }

    @media (max-width: 640px) {
      .share-modal-backdrop {
        align-items: flex-end;
        padding: 0;
      }
      
      .share-modal-card {
        max-width: 100%;
        border-radius: 32px 32px 0 0;
        padding: 36px 24px 40px;
        animation: slideUpMobile 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        padding-bottom: max(40px, env(safe-area-inset-bottom, 40px));
      }
      
      @keyframes slideUpMobile {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    }
  `
}
