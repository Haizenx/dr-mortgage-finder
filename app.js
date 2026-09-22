/**
 * DrMortgageFinder - Interactive Form, Direct Email Dispatcher & Google Ads Analytics
 * Pure static client-side implementation (zero backend required).
 */

document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.CONFIG || {};

  // Form & UI Elements
  const form = document.getElementById('lead-form');
  const formCard = document.getElementById('options-form') || document.getElementById('check');
  const formTop = document.querySelector('.form-top');
  const progressWrap = document.querySelector('.progress-wrap');
  const progressBar = document.getElementById('progress-bar');
  const stepLabel = document.getElementById('step-label');
  const percentLabel = document.getElementById('percent');
  const successContainer = document.getElementById('success');
  const successName = document.getElementById('success-name');
  const submitBtn = document.getElementById('submit-btn');
  const errorDelivery = document.getElementById('error-delivery');
  const mobileCta = document.querySelector('.mobile-cta');
  const stateSelect = document.getElementById('state');
  const phoneInput = document.getElementById('phone');

  let currentStep = 1;
  const totalSteps = 3;
  let formStarted = false;

  // Initialize dataLayer for Google Tag Manager / Google Ads
  window.dataLayer = window.dataLayer || [];

  // =========================================================================
  // 1. Dynamic Injection from Central CONFIG (config.js)
  // =========================================================================
  
  // Dynamically populate active licensed states
  if (stateSelect && Array.isArray(cfg.licensedStates) && cfg.licensedStates.length > 0) {
    const currentValue = stateSelect.value;
    stateSelect.innerHTML = '<option value="">Select a state</option>' + 
      cfg.licensedStates.map(st => `<option value="${st}">${st}</option>`).join('');
    if (currentValue) stateSelect.value = currentValue;
  }

  // Update phone numbers and links if configured
  if (cfg.phone) {
    document.querySelectorAll('.track-phone').forEach(el => {
      if (el.tagName === 'A') {
        el.setAttribute('href', `tel:${cfg.phoneRaw || cfg.phone.replace(/\D/g, '')}`);
        const phoneText = el.querySelector('.phone-text');
        if (phoneText) {
          phoneText.textContent = cfg.phone;
        } else {
          el.textContent = cfg.phone;
        }
      }
    });
  }

  // Optional: Auto-load Google Tag Manager or Google Ads gtag.js if IDs provided
  if (cfg.gtmId && !window._gtmLoaded) {
    window._gtmLoaded = true;
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer', cfg.gtmId);
    console.log('Google Tag Manager initialized with ID:', cfg.gtmId);
  } else if (cfg.googleAdsId && !window._gtagLoaded) {
    window._gtagLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${cfg.googleAdsId}`;
    document.head.appendChild(script);
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', cfg.googleAdsId);
    console.log('Google Ads gtag initialized with ID:', cfg.googleAdsId);
  }

  // =========================================================================
  // 2. Google Ads Attribution & Click Identifiers (GCLID, GBRAID, WBRAID, UTMs)
  // =========================================================================
  const params = new URLSearchParams(window.location.search);
  const trackingKeys = [
    'gclid',
    'gbraid',
    'wbraid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content'
  ];

  const capturedTracking = {};
  trackingKeys.forEach(key => {
    try {
      const val = params.get(key) || sessionStorage.getItem(key) || '';
      if (val) {
        sessionStorage.setItem(key, val);
        capturedTracking[key] = val;
        if (form && form.elements[key]) {
          form.elements[key].value = val;
        }
      }
    } catch (e) {
      console.warn('SessionStorage access failed:', e);
    }
  });

  // Track initial form view
  window.dataLayer.push({
    event: 'lead_form_view',
    form_name: 'doctor_mortgage_eligibility'
  });

  // =========================================================================
  // 3. Real-time Phone Auto-Masking (e.g. (555) 123-4567)
  // =========================================================================
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '').substring(0, 10);
      let formatted = '';
      if (digits.length === 0) {
        formatted = '';
      } else if (digits.length <= 3) {
        formatted = `(${digits}`;
      } else if (digits.length <= 6) {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
      e.target.value = formatted;
    });
  }

  // =========================================================================
  // 4. Secondary Conversion: Phone Clicks (PDF Section 4)
  // =========================================================================
  document.querySelectorAll('.track-phone, a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      window.dataLayer.push({
        event: 'phone_click',
        phone_number: link.getAttribute('href')?.replace('tel:', '') || cfg.phone || '(800) 555-0199',
        value: 0
      });
      console.log('Secondary Conversion: phone_click recorded');
    });
  });

  // =========================================================================
  // 5. Secondary Conversion: Form Start (PDF Section 4)
  // =========================================================================
  function triggerFormStart() {
    if (!formStarted) {
      formStarted = true;
      window.dataLayer.push({
        event: 'form_start',
        form_name: 'doctor_mortgage_eligibility',
        value: 0
      });
      console.log('Secondary Conversion: form_start recorded');
    }
  }

  // =========================================================================
  // 6. Mobile Sticky CTA Visibility (Intersection Observer)
  // =========================================================================
  if (mobileCta && formCard && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        mobileCta.classList.toggle('hidden', entry.isIntersecting);
      },
      { threshold: 0.08 }
    );
    observer.observe(formCard);
  }

  // =========================================================================
  // 7. Multi-Step Form Navigation & Step Validation
  // =========================================================================
  function showStep(targetStep) {
    currentStep = targetStep;

    document.querySelectorAll('.step').forEach(stepEl => {
      const stepNum = Number(stepEl.dataset.step);
      stepEl.classList.toggle('active', stepNum === targetStep);
    });

    const progressPercent = Math.round((targetStep / totalSteps) * 100);
    if (stepLabel) stepLabel.textContent = `Step ${targetStep} of ${totalSteps}`;
    if (percentLabel) percentLabel.textContent = `${progressPercent}% complete`;
    if (progressBar) progressBar.style.width = `${progressPercent}%`;

    window.dataLayer.push({
      event: 'lead_form_step_view',
      form_step: targetStep
    });

    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function validateStep(stepNumber) {
    const errorEl = document.getElementById(`error-${stepNumber}`);
    let isValid = true;

    if (stepNumber === 1) {
      const professionSelected = !!form.querySelector('input[name="profession"]:checked');
      const stateSelected = !!form.state.value.trim();
      isValid = professionSelected && stateSelected;
    } else if (stepNumber === 2) {
      const goalSelected = !!form.querySelector('input[name="goal"]:checked');
      const timelineSelected = !!form.timeline.value.trim();
      isValid = goalSelected && timelineSelected;
    } else if (stepNumber === 3) {
      const nameFilled = !!form.name.value.trim();
      const phoneDigits = form.phone.value.replace(/\D/g, '');
      const phoneValid = phoneDigits.length >= 10;
      const emailVal = form.email.value.trim();
      const emailValid = !emailVal || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      isValid = nameFilled && phoneValid && emailValid;
    }

    if (errorEl) {
      errorEl.classList.toggle('show', !isValid);
    }

    return isValid;
  }

  // Next step click handlers
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      triggerFormStart();
      const nextStep = Number(btn.dataset.next);
      if (validateStep(currentStep)) {
        window.dataLayer.push({
          event: 'step_completion',
          form_step: currentStep,
          value: 0
        });
        showStep(nextStep);
      }
    });
  });

  // Back button click handlers
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = Number(btn.dataset.back);
      showStep(prevStep);
    });
  });

  // Clear validation warnings on active input change
  form.querySelectorAll('input[type="radio"], select, input').forEach(input => {
    input.addEventListener('change', () => {
      triggerFormStart();
      const errorEl = document.getElementById(`error-${currentStep}`);
      if (errorEl && errorEl.classList.contains('show')) {
        validateStep(currentStep);
      }
    });
    input.addEventListener('focus', triggerFormStart);
  });

  // =========================================================================
  // 8. Lead Ingestion & Email Dispatch (Pure Static / Zero Backend)
  // =========================================================================
  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    if (errorDelivery) {
      errorDelivery.classList.remove('show');
    }

    // Set loading state on button
    if (submitBtn) {
      submitBtn.classList.add('loading');
    }

    const fullName = form.name.value.trim();
    const firstName = fullName.split(' ')[0] || 'Doctor';
    const profession = form.querySelector('input[name="profession"]:checked')?.value || '';
    const goal = form.querySelector('input[name="goal"]:checked')?.value || '';
    const state = form.state?.value || '';
    const leadId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const destEmail = cfg.notificationEmail && cfg.notificationEmail !== 'your-email@example.com' 
      ? cfg.notificationEmail.trim() 
      : '';

    // Build lead payload for email
    const emailPayload = {
      _subject: `New Physician Mortgage Lead: ${fullName} (${profession} - ${state})`,
      _template: 'table',
      _captcha: 'false',
      name: fullName,
      phone: form.phone.value.trim(),
      email: form.email.value.trim() || 'Not provided',
      profession: profession,
      state: state,
      goal: goal,
      timeline: form.timeline?.value || 'Not specified',
      gclid: capturedTracking.gclid || 'N/A',
      gbraid: capturedTracking.gbraid || 'N/A',
      wbraid: capturedTracking.wbraid || 'N/A',
      utm_source: capturedTracking.utm_source || 'direct',
      utm_campaign: capturedTracking.utm_campaign || 'N/A',
      utm_term: capturedTracking.utm_term || 'N/A',
      page_url: window.location.href,
      submitted_at: new Date().toLocaleString()
    };

    let deliverySuccess = false;

    // Direct Email Dispatch
    if (destEmail) {
      try {
        const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(destEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(emailPayload)
        });

        if (response.ok) {
          deliverySuccess = true;
          console.log(`Lead email dispatched to ${destEmail}:`, emailPayload);
        } else {
          console.error('Email dispatch returned non-200 status:', response.status);
        }
      } catch (err) {
        console.error('Network failure delivering lead email:', err);
      }
    } else {
      // Local Test / Default Mode (No email set yet): Simulate immediate dispatch
      console.info('No custom notificationEmail set in config.js. Simulating email dispatch:');
      console.table(emailPayload);
      await new Promise(resolve => setTimeout(resolve, 500));
      deliverySuccess = true;
    }

    // Reset button loading state
    if (submitBtn) {
      submitBtn.classList.remove('loading');
    }

    // Gated conversion: fire only on successful delivery
    if (!deliverySuccess) {
      if (errorDelivery) {
        errorDelivery.classList.add('show');
      }
      return;
    }

    // Duplicate submission prevention guard
    const alreadyConverted = sessionStorage.getItem('lead_conversion_fired');

    if (!alreadyConverted) {
      sessionStorage.setItem('lead_conversion_fired', 'true');

      // Fire PRIMARY Conversion (Page 4: Valid lead delivered, recommended value: $25)
      window.dataLayer.push({
        event: 'lead_form_submit',
        form_name: 'doctor_mortgage_eligibility',
        value: 25,
        currency: 'USD',
        transaction_id: leadId,
        lead_type: goal,
        profession: profession,
        state: state
      });
      console.log('Primary Conversion: lead_form_submit fired with value $25');
    } else {
      console.log('Duplicate submission detected. Primary conversion not re-fired.');
    }

    // Display confirmation screen
    if (successName) {
      successName.textContent = firstName;
    }
    if (form) form.style.display = 'none';
    if (progressWrap) progressWrap.style.display = 'none';
    if (formTop) formTop.style.display = 'none';
    if (successContainer) successContainer.classList.add('show');

    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // =========================================================================
  // 9. Compliance Modals (Privacy, Terms, Licensing)
  // =========================================================================
  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.getAttribute('data-modal');
      const dialog = document.getElementById(modalId);
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const dialog = closeBtn.closest('dialog');
      if (dialog && typeof dialog.close === 'function') {
        dialog.close();
      }
    });
  });

  // Close modals when clicking outside the dialog content box
  document.querySelectorAll('dialog.modal').forEach(dialog => {
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  });
});
