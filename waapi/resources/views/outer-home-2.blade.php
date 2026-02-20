<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ $CURRENT_LOCALE_DIRECTION ?? '' }}">
@php $appName = getAppSettings('name'); @endphp
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ (isset($title) and $title) ? ' - ' . $title : __tr('Welcome') }} - {{ $appName }}</title>
    <meta name="title" content="{{ $appName }}" />
    <meta name="description" content="{{ getAppSettings('description') }}" />
    <meta property="og:type" content="{{ $appName }}" />
    <meta property="og:url" content="{{ url('/') }}" />
    <meta property="og:title" content="{{ $appName }}" />
    <meta property="og:description" content="{{ getAppSettings('description') }}" />
    <meta property="og:image" content="{{ getAppSettings('logo_image_url') }}" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="{{ url('/') }}" />
    <meta property="twitter:title" content="{{ $appName }}" />
    <meta property="twitter:description" content="{{ getAppSettings('description') }}" />
    <meta property="twitter:image" content="{{ getAppSettings('logo_image_url') }}" />
    <link href="{{ getAppSettings('favicon_image_url') }}" rel="icon">
    {!! __yesset(['static-assets/packages/fontawesome/css/all.css','static-assets/packages/bootstrap-icons/font/bootstrap-icons.css']) !!}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
    <style>section{background-color:#F2F4F7}.text-primary{color:#232fcc!important}.bg-primary{background-color:#232fcc!important}.card:hover h5{color:#0866FF!important;transition:color .3s ease}.card i{color:#0866FF!important}.gradient-icon-1{font-size:30px!important;background:linear-gradient(135deg,#41C6B5,#1771E6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}.rounded-icon{background-color:#fff;width:60px;height:60px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center}.gradient-icon-2{font-size:30px!important;background:linear-gradient(90deg,#9eefe6,#2dbcab);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}.gradient-icon-3{font-size:30px!important;background:linear-gradient(135deg,#D32E9A,#8D5DEA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}.gradient-icon-4{font-size:30px!important;background:linear-gradient(45deg,#F19946,#E34F95);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}.gradient-icon-5{font-size:30px!important;background:linear-gradient(135deg,#1765C9,#55BFF0);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}.gradient-icon-6{font-size:30px!important;background:linear-gradient(135deg,#707d8e,#021C42);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}.gradient-icon-7{font-size:30px!important;background:linear-gradient(135deg,#c4c4c4,#6C757D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}.gradient-icon-8{font-size:30px!important;background:linear-gradient(135deg,#b5d1ff,#0866FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}.gradient-icon-9{font-size:30px!important;background:linear-gradient(135deg,#22D571,#21d3c7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}.gradient-icon-10{font-size:30px!important;background:linear-gradient(45deg,#A136E6,#5eb4ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}.features:hover h3,.features:hover h5{color:#0866FF!important;transition:color .3s ease}</style>
<body class="lw-outer-home-page">
    {!! __yesset(['dist/css/app-home.css'], true) !!}
    <body id="page-top">
        <header class="lw-top-navbar shadow-sm">
            <nav class="navbar navbar-expand-lg navbar-light bg-white fixed-top border-bottom" id="mainNav">
                <div class="container px-4 px-lg-5 d-flex justify-content-between align-items-center">
                    <a class="navbar-brand" href="/"><img src="{{ getAppSettings('logo_image_url') }}" class="navbar-brand-img" alt="Logo"></a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="{{ __tr('Toggle navigation') }}"><span class="navbar-toggler-icon"></span></button>
                    <div class="collapse navbar-collapse justify-content-center" id="navbarResponsive">
                        <ul class="navbar-nav text-center gap-2 gap-lg-4">
                            <li class="nav-item"><a class="nav-link" href="/">{{ __tr('Home') }}</a></li>
                            <li class="nav-item"><a class="nav-link" href="#features-section">{{ __tr('Features') }}</a></li>          
                            <li class="nav-item"><a class="nav-link" href="#pricing">{{ __tr('Pricing') }}</a></li>
                            <li class="nav-item"><a class="nav-link" href="#faq">{{ __tr('FAQ') }}</a></li>
                            <li class="nav-item"><a class="nav-link" href="{{ route('user.contact.form') }}">{{ __tr('Contact') }}</a></li>
                            @include('layouts.navbars.navs.pages-menu-partial')
                        </ul>
                        <div class="d-lg-none text-center mt-3">
                            @if (!isLoggedIn())<a class="btn btn-success text-white w-100 mb-2" href="{{ route('auth.login') }}">{{ __tr('Login') }}</a>@endif
                            @if (isLoggedIn())<a class="btn btn-success text-white fw-bold w-100" href="{{ route('central.console') }}">{{ __tr('Dashboard') }}</a>@endif
                        </div>
                    </div>
                    <div class="d-none d-lg-flex align-items-center gap-2">
                        @if (!isLoggedIn())<a class="btn btn-success text-white px-3" href="{{ route('auth.login') }}">{{ __tr('Login') }}</a>@endif
                        @if (isLoggedIn())<a class="btn btn-success text-white fw-bold px-3" href="{{ route('central.console') }}">{{ __tr('Dashboard') }}</a>@endif
                    </div>
                </div>
            </nav>
        </header>
        <style>.lw-top-navbar .navbar{transition:all .3s ease-in-out;padding:.8rem 0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;font-size:1rem;z-index:1030}.lw-top-navbar .navbar-brand-img{height:46px;max-height:52px;object-fit:contain;transition:transform .3s ease}.lw-top-navbar .navbar-brand-img:hover{transform:scale(1.05)}.lw-top-navbar .nav-link{font-weight:500;color:#333;transition:color .3s ease,transform .2s ease;position:relative;padding:.5rem .8rem}.lw-top-navbar .nav-link:hover{color:#198754;transform:translateY(-2px)}.lw-top-navbar .nav-link::after{content:"";position:absolute;width:0;height:2px;left:50%;bottom:0;background-color:#198754;transition:all .3s ease}.lw-top-navbar .nav-link:hover::after{width:100%;left:0}.lw-top-navbar .btn{border-radius:30px;font-weight:500;transition:all .3s ease;background-color:#198754;border:none;padding:.45rem 1.2rem}.lw-top-navbar .btn:hover{background-color:#157347;transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.12)}@media (max-width:991px){.lw-top-navbar .navbar-collapse{background:#fff;border-radius:0 0 12px 12px;padding:1rem;box-shadow:0 6px 18px rgba(0,0,0,.08)}.lw-top-navbar .nav-item{margin-bottom:.5rem}.lw-top-navbar .navbar-collapse ul{margin-bottom:1rem}.lw-top-navbar .navbar-collapse .btn{width:100%;margin-bottom:.5rem}}body{padding-top:80px;scroll-behavior:smooth}@media (max-width:991px){body{padding-top:50px}}#features-section,#pricing,#demo-section{scroll-margin-top:90px}</style>
        <section class="premium-hero py-5">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-6 col-md-12 mb-4 mb-lg-0">
                        <h1 class="display-5 fw-bold text-gradient mb-3">{!! __tr('__appName__', ['__appName__' => $appName]) !!}</h1>
                        <h2 class="fs-3 text-dark fw-semibold mb-4 hero-subtitle">{{ __tr('Best WhatsApp API Platform') }}</h2>
                        <p class="lead text-muted mb-4">{{ __tr('This Platform delivers Meta Verified messaging with affordable plans for startups, SMEs, and enterprises, offering AI-powered communication and automation tools.', ['__appName__' => $appName]) }}</p>
                        <div class="d-flex flex-wrap gap-3">
                            <a href="{{ route('auth.register') }}" class="btn btn-success btn-lg shadow-sm px-4">{{ __tr('Start Free') }}</a>
                            <a href="#features-section" class="btn btn-outline-success btn-lg shadow-sm px-4">{{ __tr('Explore Features') }}</a>
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-12"><img src="{{ asset('imgs/outer-home/Api.webp') }}" class="img-fluid hero-img" alt="Best WhatsApp Marketing Software - {{ $appName }}"></div>
                </div>
            </div>
        </section>
        <style>.premium-hero{background:#f8fdf9;padding-top:5rem;padding-bottom:5rem}.text-gradient{background:linear-gradient(90deg,#28a745,#20c997);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.hero-img{max-width:100%;border-radius:0;box-shadow:0 0 2px rgba(0,0,0,.15);transition:transform .3s ease-in-out}@media (max-width:991px){.premium-hero{padding-top:3rem;padding-bottom:3rem}.hero-img{max-width:100%;margin-top:2rem}}@media (max-width:576px){.premium-hero h1{font-size:1.9rem}.premium-hero .hero-subtitle{font-size:1.1rem}.premium-hero p{font-size:.95rem}.premium-hero .btn-lg{font-size:.95rem;padding:.6rem 1.2rem}}</style>
        <section id="features-section" class="features-area py-5 bg-light scroll-margin-top">
            <div class="container">
                <div class="text-center mb-5">
                    <h2 class="fw-bold display-6 text-gradient">Features of <span class="text-success">{{ $appName }}</span></h2>
                    <p class="text-muted mt-3 mb-0">Boost engagement and grow your business with advanced WhatsApp marketing tools that automate messaging, streamline communication, and drive results.</p>
                </div>
                <div class="row g-4">
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-primary mb-3"><i class="fas fa-user-plus fa-2x"></i></div>
                            <h4 class="fw-bold">Embedded Signup</h4>
                            <p class="text-muted">Onboard customers instantly with a secure and integrated signup flow.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-success mb-3"><i class="fab fa-whatsapp fa-2x"></i></div>
                            <h4 class="fw-bold">Integrated WhatsApp Chat</h4>
                            <p class="text-muted">Connect with customers directly using official WhatsApp messaging.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-danger mb-3"><i class="fas fa-qrcode fa-2x"></i></div>
                            <h4 class="fw-bold">QR Code</h4>
                            <p class="text-muted">Generate custom QR codes to instantly connect customers on WhatsApp.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-info mb-3"><i class="fas fa-comments fa-2x"></i></div>
                            <h4 class="fw-bold">Chat-Bot</h4>
                            <p class="text-muted">Provide 24/7 customer support with AI-driven automated chatbots.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-warning mb-3"><i class="fas fa-file-alt fa-2x"></i></div>
                            <h4 class="fw-bold">Manage Templates</h4>
                            <p class="text-muted">Easily create, edit, and manage message templates without extra steps.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-purple mb-3"><i class="fas fa-project-diagram fa-2x"></i></div>
                            <h4 class="fw-bold">Flow Maker</h4>
                            <p class="text-muted">Design powerful automated workflows with our drag-and-drop flow maker.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-dark mb-3"><i class="fas fa-plug fa-2x"></i></div>
                            <h4 class="fw-bold">API Integration</h4>
                            <p class="text-muted">Seamlessly integrate with third-party services through secure APIs.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-success mb-3"><i class="fas fa-chart-line fa-2x"></i></div>
                            <h4 class="fw-bold">Live Analysis</h4>
                            <p class="text-muted">Track real-time performance and measure campaign effectiveness instantly.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-primary mb-3"><i class="fas fa-user-friends fa-2x"></i></div>
                            <h4 class="fw-bold">Assign Agents</h4>
                            <p class="text-muted">Distribute chats among your team with agent assignment features.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-danger mb-3"><i class="fas fa-bullhorn fa-2x"></i></div>
                            <h4 class="fw-bold">Campaigns</h4>
                            <p class="text-muted">Run, monitor, and optimize bulk campaigns for maximum impact.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-info mb-3"><i class="fas fa-robot fa-2x"></i></div>
                            <h4 class="fw-bold">AI Chatbot</h4>
                            <p class="text-muted">Automate conversations with advanced AI to provide smart responses.</p>
                        </div>
                    </div>
                    <div class="col-md-6 col-lg-4">
                        <div class="feature-card p-4 bg-white rounded-4 shadow-sm h-100">
                            <div class="feature-icon text-warning mb-3"><i class="fas fa-chart-pie fa-2x"></i></div>
                            <h4 class="fw-bold">Chat Report</h4>
                            <p class="text-muted">Access detailed analytics and reports for all your WhatsApp chats.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <style>html{scroll-behavior:smooth}.scroll-margin-top{scroll-margin-top:80px}.text-gradient{background:linear-gradient(90deg,#198754,#20c997);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.features-area .feature-card{transition:all .35s ease;cursor:pointer;border:1px solid rgba(0,0,0,.05);background:rgba(255,255,255,.9);backdrop-filter:blur(6px)}.features-area .feature-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 12px 30px rgba(0,0,0,.12);border-color:rgba(25,135,84,.35)}.features-area .feature-icon{width:70px;height:70px;display:flex;align-items:center;justify-content:center;background:rgba(25,135,84,.08);border-radius:50%;transition:all .3s ease}.features-area .feature-card:hover .feature-icon{transform:scale(1.15);background:rgba(25,135,84,.15)}.text-purple{color:#6f42c1}@media (max-width:767.98px){.features-area .feature-card{text-align:center}}</style>
        <section class="premium-about py-5" id="about-us">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-6 col-md-12 text-center text-lg-start mb-4 mb-lg-0">
                        <h1 class="fw-bold text-gradient mb-3">{!! __tr('__appName__', ['__appName__' => $appName]) !!}</h1>
                        <h2 class="fw-semibold text-dark mb-2">{{ __tr('Powered by Official WhatsApp Cloud API') }} <i class="fab fa-whatsapp text-success"></i></h2>
                        <p class="lead text-muted">{{ __tr('A next-gen WhatsApp marketing and customer engagement platform built on Meta’s official Cloud API.') }}</p>
                    </div>
                    <div class="col-lg-6 col-md-12">
                        <div class="description text-muted" style="text-align:justify"><span class="fw-bold text-success">{!! __tr('__appName__', ['__appName__' => $appName]) !!}</span> {{ __tr(' integrates directly with the Official WhatsApp Cloud API, empowering businesses with real-time messaging, AI-powered automation, and secure communication worldwide.') }}<br><br>{{ __tr('With this seamless integration, companies can send verified messages, automate customer interactions, share multimedia, and track engagement through powerful analytics. The platform also provides workflow automation, template management, and scalable solutions for startups, SMEs, and enterprises.') }}<br><br>{{ __tr('Experience faster, safer, and smarter WhatsApp business communication — all in one intuitive dashboard designed for growth.') }}</div>
                    </div>
                </div>
            </div>
        </section>
        <style>.premium-about{background:#fff}.text-gradient{background:linear-gradient(90deg,#28a745,#20c997);-webkit-background-clip:text;-webkit-text-fill-color:transparent}@media (max-width:576px){.premium-about h1{font-size:1.8rem}.premium-about h2{font-size:1.2rem}.premium-about p,.premium-about .description{font-size:.95rem}}</style>
        <section id="pricing" class="premium-pricing py-5">
            <div class="container">
                <div class="text-center mb-5">
                    <h1 class="fw-bold display-5"><span class="text-gradient">{!! __tr('__appName__', ['__appName__' => $appName]) !!}</span> User Plans</h1>
                    <p class="text-muted mt-2 fs-5">Choose the plan that fits your business needs. Upgrade anytime with ease.</p>
                </div>
                <div class="row g-4 justify-content-center">
                    @php $freePlanDetails = getFreePlan(); $freePlanStructure = getConfigFreePlan(); $paidPlans = getPaidPlans(); $planStructure = getConfigPaidPlans(); @endphp
                    @if ($freePlanDetails['enabled'])
                    <div class="col-12 col-md-6 col-lg-4">
                        <div class="pricing-card h-100 shadow-sm p-4 d-flex flex-column">
                            <h4 class="fw-bold text-muted mb-3">{{ $freePlanDetails['title'] }}</h4>
                            <div class="price fw-bold mb-3 text-dark"><span class="h1">{{ formatAmount(0, true, true) }}</span><small class="text-muted">/yearly</small></div>
                            <a class="small text-primary fw-bold text-decoration-none mb-3" target="_blank" href="https://business.whatsapp.com/products/platform-pricing">+ WhatsApp Cloud Messaging Charges</a>
                            <hr>
                            <ul class="list-unstyled flex-grow-1">
                                @foreach ($freePlanStructure['features'] as $featureKey => $featureValue)
                                @php $configFeatureValue = $featureValue; $featureValue = $freePlanDetails['features'][$featureKey]; @endphp
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i>
                                    @if (isset($featureValue['type']) && $featureValue['type'] == 'switch') {{ $configFeatureValue['description'] }}
                                    @else <strong class="text-success">@if (isset($featureValue['limit']) && $featureValue['limit'] < 0) {{ __tr('Unlimited') }} @elseif(isset($featureValue['limit'])) {{ __tr($featureValue['limit']) }} @endif</strong> {{ $configFeatureValue['description'] }} {{ $configFeatureValue['limit_duration_title'] ?? '' }} @endif
                                </li>
                                @endforeach
                            </ul>
                            <div class="mt-3"><a href="{{ route('auth.register') }}" class="btn btn-success w-100 fw-bold">{{ __tr('Start Free') }}</a></div>
                        </div>
                    </div>
                    @endif
                    @foreach ($planStructure as $planKey => $plan)
                    @php $planId = $plan['id']; $features = $plan['features']; $savedPlan = $paidPlans[$planKey]; $charges = $savedPlan['charges']; @endphp
                    @if ($savedPlan['enabled'])
                    <div class="col-12 col-md-6 col-lg-4">
                        <div class="pricing-card h-100 shadow-sm p-4 d-flex flex-column">
                            <h4 class="fw-bold text-muted mb-3">{{ $savedPlan['title'] ?? $plan['title'] }}</h4>
                            @foreach ($charges as $itemKey => $itemValue)
                            @if ($itemValue['enabled'])
                            <div class="price fw-bold mb-3 text-dark"><span class="h1">{{ formatAmount($itemValue['charge'], true, true) }}</span><small class="text-muted">/{{ Arr::get($plan['charges'][$itemKey], 'title', '') }}</small></div>
                            @endif
                            @endforeach
                            <a class="small text-primary fw-bold text-decoration-none mb-3" target="_blank" href="https://business.whatsapp.com/products/platform-pricing">+ WhatsApp Cloud Messaging Charges</a>
                            <hr>
                            <ul class="list-unstyled flex-grow-1">
                                @foreach ($plan['features'] as $featureKey => $featureValue)
                                @php $configFeatureValue = $featureValue; $featureValue = $savedPlan['features'][$featureKey]; @endphp
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i>
                                    @if (isset($featureValue['type']) && $featureValue['type'] == 'switch') {{ $configFeatureValue['description'] }}
                                    @else <strong class="text-success">@if (isset($featureValue['limit']) && $featureValue['limit'] < 0) {{ __tr('Unlimited') }} @elseif(isset($featureValue['limit'])) {{ __tr($featureValue['limit']) }} @endif</strong> {{ $configFeatureValue['description'] }} {{ $configFeatureValue['limit_duration_title'] ?? '' }} @endif
                                </li>
                                @endforeach
                            </ul>
                            <div class="mt-3"><a href="{{ route('auth.register') }}" class="btn btn-outline-success w-100 fw-bold">{{ __tr('Choose Plan') }}</a></div>
                        </div>
                    </div>
                    @endif
                    @endforeach
                </div>
            </div>
        </section>
        <style>.premium-pricing{background:#fff}.text-gradient{background:linear-gradient(90deg,#28a745,#20c997);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.pricing-card{border-radius:20px;background:#f9fdfb;transition:all .3s ease-in-out;border:1px solid #e5e7eb;display:flex;flex-direction:column}.pricing-card:hover{transform:translateY(-8px);box-shadow:0 12px 28px rgba(0,0,0,.12)}.pricing-card h4{font-size:1.4rem}.price span.h1{font-size:2rem}.price small{font-size:.9rem}@media (max-width:768px){.premium-pricing h1{font-size:1.8rem}.pricing-card h4{font-size:1.2rem}.price span.h1{font-size:1.6rem}}</style>
        <section class="premium-faq py-5" id="faq">
            <div class="container">
                <div class="text-center mb-5">
                    <h1 class="fw-bold display-5"><span class="text-gradient">{!! __tr('__appName__', ['__appName__' => $appName]) !!}</span> {{ __tr("Frequently Asked Questions") }}</h1>
                    <p class="text-muted mt-3 fs-5">{{ __tr("Find answers to the most common questions about WhatsApp Business API, automation, and messaging with") }} {!! __tr('__appName__', ['__appName__' => $appName]) !!}.</p>
                </div>
                <div class="row g-4 justify-content-center">
                    <div class="col-lg-6 col-md-12">
                        <div class="faq-card p-4 h-100 rounded shadow-sm">
                            <h5 class="fw-bold text-dark mb-2">{{ __tr("1. What is WhatsApp Business API and how does it work?") }}</h5>
                            <p class="text-muted mb-0">{{ __tr("The WhatsApp Business API is an official Meta solution that allows businesses to send and receive messages at scale. It helps companies automate communication, provide customer support, and send notifications securely.") }}</p>
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-12">
                        <div class="faq-card p-4 h-100 rounded shadow-sm">
                            <h5 class="fw-bold text-dark mb-2">{{ __tr("2. How can my business get started with the WhatsApp API?") }}</h5>
                            <p class="text-muted mb-0">{{ __tr("To get started, sign up on our platform, connect your WhatsApp Business Account, and complete Meta’s verification process. Our dashboard guides you step by step to go live quickly.") }}</p>
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-12">
                        <div class="faq-card p-4 h-100 rounded shadow-sm">
                            <h5 class="fw-bold text-dark mb-2">{{ __tr("3. Can I send bulk WhatsApp messages using this platform?") }}</h5>
                            <p class="text-muted mb-0">{{ __tr("Yes. Our platform supports sending bulk WhatsApp messages using pre-approved templates. This helps you run promotions, alerts, and customer updates while staying compliant with WhatsApp policies.") }}</p>
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-12">
                        <div class="faq-card p-4 h-100 rounded shadow-sm">
                            <h5 class="fw-bold text-dark mb-2">{{ __tr("4. Does WhatsApp Business API support chatbots and automation?") }}</h5>
                            <p class="text-muted mb-0">{{ __tr("Absolutely. Our system integrates AI-powered chatbots and automation workflows. This allows businesses to reply instantly, reduce response time, and handle customer queries 24/7.") }}</p>
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-12">
                        <div class="faq-card p-4 h-100 rounded shadow-sm">
                            <h5 class="fw-bold text-dark mb-2">{{ __tr("5. Is customer data secure with WhatsApp Business API?") }}</h5>
                            <p class="text-muted mb-0">{{ __tr("Yes. All messages are end-to-end encrypted and our platform follows strict security protocols. We comply with WhatsApp’s official privacy and Meta’s data protection standards.") }}</p>
                        </div>
                    </div>
                    <div class="col-lg-6 col-md-12">
                        <div class="faq-card p-4 h-100 rounded shadow-sm">
                            <h5 class="fw-bold text-dark mb-2">{{ __tr("6. What are the costs of using WhatsApp Business API?") }}</h5>
                            <p class="text-muted mb-0">{{ __tr("WhatsApp API pricing is based on conversation categories (utility, authentication, marketing, and service). Our platform offers affordable monthly plans tailored for startups, SMEs, and enterprises.") }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <style>.premium-faq{background:#f9fdfb}.text-gradient{background:linear-gradient(90deg,#28a745,#20c997);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.faq-card{background:#fff;border-left:5px solid #28a745;transition:all .3s ease-in-out}.faq-card:hover{transform:translateY(-6px);box-shadow:0 10px 24px rgba(0,0,0,.12)}@media (max-width:768px){.premium-faq h1{font-size:1.8rem}.premium-faq p{font-size:1rem}.faq-card h5{font-size:1rem}.faq-card p{font-size:.92rem}}</style>
        <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is WhatsApp Business API and how does it work?","acceptedAnswer":{"@type":"Answer","text":"The WhatsApp Business API is an official Meta solution that allows businesses to send and receive messages at scale. It helps companies automate communication, provide customer support, and send notifications securely."}},{"@type":"Question","name":"How can my business get started with the WhatsApp API?","acceptedAnswer":{"@type":"Answer","text":"To get started, sign up on our platform, connect your WhatsApp Business Account, and complete Meta’s verification process. Our dashboard guides you step by step to go live quickly."}},{"@type":"Question","name":"Can I send bulk WhatsApp messages using this platform?","acceptedAnswer":{"@type":"Answer","text":"Yes. Our platform supports sending bulk WhatsApp messages using pre-approved templates. This helps you run promotions, alerts, and customer updates while staying compliant with WhatsApp policies."}},{"@type":"Question","name":"Does WhatsApp Business API support chatbots and automation?","acceptedAnswer":{"@type":"Answer","text":"Absolutely. Our system integrates AI-powered chatbots and automation workflows. This allows businesses to reply instantly, reduce response time, and handle customer queries 24/7."}},{"@type":"Question","name":"Is customer data secure with WhatsApp Business API?","acceptedAnswer":{"@type":"Answer","text":"Yes. All messages are end-to-end encrypted and our platform follows strict security protocols. We comply with WhatsApp’s official privacy and Meta’s data protection standards."}},{"@type":"Question","name":"What are the costs of using WhatsApp Business API?","acceptedAnswer":{"@type":"Answer","text":"WhatsApp API pricing is based on conversation categories (utility, authentication, marketing, and service). Our platform offers affordable monthly plans tailored for startups, SMEs, and enterprises."}}]}</script>
        <footer class="footer-section text-white bg-dark pt-5">
            <div class="container">
                <div class="row gy-4">
                    <div class="col-lg-4 col-xl-4 footer-about" style="flex:0 0 34%;max-width:34%">
                        <div class="footer-logo mb-3"><a href="{{ url('/') }}"><img src="{{ getAppSettings('logo_image_url') }}" alt="{{ getAppSettings('name') }}" class="img-fluid" style="max-height:60px"></a></div>
                        <p class="small text-light">{{ getAppSettings('name') }} {{ __tr('provides advanced WhatsApp Business API solutions with Meta Verified messaging. Affordable plans for startups, SMEs, and enterprises, featuring AI-powered communication, automation tools, and seamless messaging integration.') }}</p>
                    </div>
                    <div class="col-lg-2 col-xl-2 footer-links">
                        <h5 class="fw-bold mb-3">{{ __tr('Useful Links') }}</h5>
                        <ul class="list-unstyled">
                            <li><a href="{{ url('/') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Home') }}</a></li>
                            <li><a href="{{ url('#pricing') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Pricing') }}</a></li>
                            <li><a href="{{ url('#features-section') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Features') }}</a></li>
                            <li><a href="{{ url('#faq') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('API FAQ') }}</a></li>
                            <li><a href="{{ url('https://www.youtube.com/@TechnicalThought') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Tutorial') }}</a></li>          
                        </ul>
                    </div>
                    <div class="col-lg-2 col-xl-2 footer-pages">
                        <h5 class="fw-bold mb-3">{{ __tr('Pages') }}</h5>
                        <ul class="list-unstyled">
                            <li><a href="{{ url('/page/d98ce67a-f8fd-47da-871a-bebb246abd3e/about') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('About Us') }}</a></li>
                            <li><a href="{{ url('/page/f42d2087-7f4a-4c3e-8957-b9bf850eefb7/contact') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Contact us') }}</a></li>
                            <li><a href="{{ url('/page/09035dc7-ee9f-40dd-90df-06a986f34584/privacy') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Privacy Policy') }}</a></li>
                            <li><a href="{{ url('/page/e80a7e0a-324c-4c87-ad8a-a3ea139fbda2/disclaimer') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Disclaimer') }}</a></li>
                            <li><a href="{{ url('/page/4917936f-a1bd-4dfb-8ae1-d9f04885bd18/terms') }}" class="text-white text-decoration-none d-block py-1">{{ __tr('Terms of Use') }}</a></li>          
                        </ul>
                    </div>
                    <div class="col-lg-4 col-xl-4 footer-contact" style="flex:0 0 30%;max-width:30%">
                        <h5 class="fw-bold mb-3">{{ __tr('Contact') }}</h5>
                        <ul class="list-unstyled small">
                            @if (getAppSettings('contact_details'))<li>{!! getAppSettings('contact_details') !!}</li>
                            @else<li>{{ __tr('Email: support@ttmsg.com') }}</li><li>{{ __tr('Phone: +91 9755542018') }}</li><li>{{ __tr('Address: Hoshangabad, India') }}</li>@endif
                        </ul>
                        <div class="footer-social-icon mt-3">
                            <a href="https://www.youtube.com/@ttmsg" class="me-2 fs-6"><i class="fab fa-youtube"></i></a>
                            <a href="https://www.instagram.com/TTMSGOfficial" class="me-2 fs-6"><i class="fab fa-instagram"></i></a>
                            <a href="https://whatsapp.com/channel/0029VbB2lg93QxSAGSu8SG0w" class="me-2 fs-6"><i class="fab fa-whatsapp"></i></a>
                        </div>
                    </div>
                </div>
                <hr class="border-light mt-5">
                <div class="pb-3 small text-light text-center">
    &copy; {{ getAppSettings('name') }} {{ date('Y') }}. {{ __tr('All Rights Reserved.') }} 
    Design By - <a href="https://technicalthought.com/" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-success">TechnicalThough.com </a>
</div>

            </div>
        </footer>
        <style>.footer-section a{color:#ddd;transition:all .3s ease-in-out}.footer-section a:hover{color:#20c997!important;padding-left:4px}.footer-social-icon a i{color:#fff!important}.footer-social-icon a:hover i{color:#fff!important;transform:scale(1.2)}@media (max-width:991px){.footer-about{flex:0 0 100%!important;max-width:100%!important;text-align:left!important;padding-left:25px}.footer-links,.footer-pages{flex:0 0 50%!important;max-width:50%!important;text-align:left!important;padding-left:25px}.footer-contact{flex:0 0 100%!important;max-width:100%!important;text-align:center!important}}</style>
        <script>(function(){'use strict';window.appConfig={debug:"{{ config('app.debug') }}",csrf_token:"{{ csrf_token() }}",locale:'{{ app()->getLocale() }}',}})();</script>
        {!! __yesset(['dist/js/common-vendorlibs.js','dist/js/vendorlibs.js','dist/packages/bootstrap/js/bootstrap.bundle.min.js','dist/js/jsware.js']) !!}
        {!! getAppSettings('page_footer_code_all') !!}
        @if (isLoggedIn()){!! getAppSettings('page_footer_code_logged_user_only') !!}@endif
    </body>
</html>