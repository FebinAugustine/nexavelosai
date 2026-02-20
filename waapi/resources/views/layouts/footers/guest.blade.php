<!-- 🌟 Footer Section --> 
<footer class="footer-section text-white bg-dark pt-5 mt-4" 
        style="margin-top:20px; margin-bottom:-10px; padding-bottom:0;">
  <div class="container" style="margin-bottom:-10px; padding-bottom:0;">

    <div class="row gy-4">

      <!-- Logo & About (34%) -->
      <div class="col-lg-4 col-xl-4 footer-about" style="flex: 0 0 34%; max-width: 34%;">
        <div class="footer-logo mb-3">
          <a href="{{ url('/') }}">
            <img src="{{ getAppSettings('logo_image_url') }}" 
                 alt="{{ getAppSettings('name') }}" 
                 class="img-fluid" style="max-height: 60px;">
          </a>
        </div>
        <p class="small">
          {{ getAppSettings('name') }} {{ __tr('provides advanced WhatsApp Business API solutions with Meta Verified messaging. Affordable plans for startups, SMEs, and enterprises, featuring AI-powered communication, automation tools, and seamless messaging integration.') }}
        </p>
      </div>

      <!-- Useful Links (18%) -->
      <div class="col-lg-2 col-xl-2 footer-links">
        <h5 class="footer-heading">{{ __tr('Useful Links') }}</h5>
        <ul class="list-unstyled">
          <li><a href="{{ url('/') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Home') }}</a></li>
          <li><a href="{{ url('#pricing') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Pricing') }}</a></li>
          <li><a href="{{ url('#features-section') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Features') }}</a></li>
          <li><a href="{{ url('#faq') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('API FAQ') }}</a></li>
          <li><a href="{{ url('https://www.youtube.com/@TechnicalThought') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Tutorial') }}</a></li>          
        </ul>
      </div>

      <!-- Pages (18%) -->
      <div class="col-lg-2 col-xl-2 footer-pages">
        <h5 class="footer-heading">{{ __tr('Pages') }}</h5>
        <ul class="list-unstyled">
          <li><a href="{{ url('/page/d98ce67a-f8fd-47da-871a-bebb246abd3e/about') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('About Us') }}</a></li>
          <li><a href="{{ url('/page/f42d2087-7f4a-4c3e-8957-b9bf850eefb7/contact') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Contact us') }}</a></li>
          <li><a href="{{ url('/page/09035dc7-ee9f-40dd-90df-06a986f34584/privacy') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Privacy Policy') }}</a></li>
          <li><a href="{{ url('/page/e80a7e0a-324c-4c87-ad8a-a3ea139fbda2/disclaimer') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Disclaimer') }}</a></li>
          <li><a href="{{ url('/page/4917936f-a1bd-4dfb-8ae1-d9f04885bd18/terms') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Terms of Use') }}</a></li>          
        </ul>
      </div>

      <!-- Contact (30%) -->
      <div class="col-lg-4 col-xl-4 footer-contact" style="flex: 0 0 30%; max-width: 30%;">
        <h5 class="footer-heading">{{ __tr('Contact') }}</h5>
        <ul class="list-unstyled small text-white">
          @if (getAppSettings('contact_details'))
            <li>{!! getAppSettings('contact_details') !!}</li>
          @else
            <li>{{ __tr('Email: support@ttmsg.com') }}</li>
            <li>{{ __tr('Phone: +91 9755542018') }}</li>
            <li>{{ __tr('Address: Hoshangabad, India') }}</li>
          @endif
        </ul>

        <!-- ✅ Social icons under Contact -->
        <div class="footer-social-icon mt-3 text-center">
          <a href="#" class="social-round"><i class="fab fa-youtube"></i></a>
          <a href="#" class="social-round"><i class="fab fa-instagram"></i></a>
          <a href="#" class="social-round"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>

    </div>

    <hr class="border-light mt-5">

    <!-- Copyright -->
    <div class="pb-3 small text-light text-center mb-0">
      &copy; {{ getAppSettings('name') }} {{ date('Y') }}. {{ __tr('All Rights Reserved.') }}
    </div>

  </div>
</footer>

<!-- 🌟 Footer CSS -->
<style>
body {
  margin: 0 !important;
  padding: 0 !important;
}

.footer-section a {
  color: #ddd;
  transition: all 0.3s ease-in-out;
}
.footer-section a:hover {
  color: #20c997 !important;
  padding-left: 4px;
}

/* ✅ Headings font size & bold */
.footer-heading {
  font-size: 20px !important;
  font-weight: 900 !important; /* Extra Bold */
  color: #fff !important;
}

/* ✅ About text white */
.footer-about p {
  color: #fff !important;
}

/* ✅ Social icons round */
.footer-social-icon {
  text-align: center;
}
.footer-social-icon .social-round {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 5px;
  border-radius: 50%;
  background: #333;
  color: #fff !important;
  font-size: 18px;
  transition: 0.3s;
}
.footer-social-icon .social-round:hover {
  background: #20c997;
  transform: scale(1.1);
}

/* ✅ Remove unwanted bottom space */
footer, .footer-section {
  margin-bottom: -50px !important;
  padding-bottom: 0 !important;
}

/* Responsive */
@media (max-width: 991px) {
  .footer-about {
    flex: 0 0 100% !important;
    max-width: 100% !important;
    text-align: left !important;
    padding-left: 25px;
  }

  .footer-links, 
  .footer-pages {
    flex: 0 0 50% !important;
    max-width: 50% !important;
    text-align: left !important;
    padding-left: 25px;
  }

  .footer-contact {
    flex: 0 0 100% !important;
    max-width: 100% !important;
    text-align: center !important;
  }
}
</style>
