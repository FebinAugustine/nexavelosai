<style>
    #sidenav-main {
        background-color: #ffffff !important;
    }
    .rounded-icon {
        background-color: #E2E5E9;
        width: 24px;
        height: 24px; 
        border-radius: 50%; 
        display: inline-flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 12px !important;
    }
    .gradient-icon-1 {
        font-size: 25px !important;
        background: linear-gradient(135deg, #41C6B5, #1771E6); 
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .gradient-icon-2 {
        font-size: 25px !important;
        background: linear-gradient(90deg,  #9eefe6, #2dbcab);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .gradient-icon-3 {
        font-size: 25px !important;
        background: linear-gradient(135deg, #D32E9A, #8D5DEA);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .gradient-icon-4 {
        font-size: 25px !important;
        background: linear-gradient(45deg, #F19946, #E34F95);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .gradient-icon-5 {
        font-size: 25px !important;
        background: linear-gradient(135deg, #1765C9, #55BFF0);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .gradient-icon-6 {
        font-size: 25px !important;
        background: linear-gradient(135deg, #707d8e, #021C42);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .gradient-icon-7 {
        font-size: 25px !important;
        background: linear-gradient(135deg, #c4c4c4, #6C757D);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .gradient-icon-8 {
        font-size: 25px !important;
        background: linear-gradient(135deg, #b5d1ff, #0866FF);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .gradient-icon-9 {
        font-size: 25px !important;
        background: linear-gradient(135deg, #22D571, #21d3c7);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .gradient-icon-10 {
        font-size: 25px !important;
        background: linear-gradient(45deg, #A136E6, #5eb4ff);
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .nav-link {
        font-weight: 600;
    }
    a.nav-link:hover {
        background-color: #F6F9FC;
    }
    .bg-primary-light {
    }
    .nav-link-ul::before {
        content: '';
        position: absolute;
        transform: translateY(-50%);
        width: 8px; 
        height: 1px;
        background-color: #000000; 
        transition: width 0.3s ease;
    }

    .nav-link-ul:hover::before {
        width: 15px;
    }
</style>
<nav class="navbar navbar-vertical fixed-left navbar-expand-md navbar-light lw-sidebar-container" id="sidenav-main">
    <div class="container-fluid">
        <span>
            <!-- Toggler -->
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#sidenav-collapse-main"
        aria-controls="sidenav-main" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <!-- Brand -->
    <a class="navbar-brand pt-0 d-none d-sm-inline" href="{{ url('/') }}">
        <img src="{{ getAppSettings('logo_image_url') }}" class="navbar-brand-img lw-sidebar-logo-normal" alt="{{ getAppSettings('name') }}">
        <img src="{{ getAppSettings('small_logo_image_url') }}" class="navbar-brand-img lw-sidebar-logo-small" alt="{{ getAppSettings('name') }}">
    </a>
        </span>
        <!-- User -->
        <ul class="nav align-items-center d-md-none">
            <li class="nav-item">
                @include('layouts.navbars.locale-menu')
              </li>
            <li class="nav-item dropdown">
                <a class="nav-link" href="#" role="button" data-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <div class="media align-items-center">
                        <span class="avatar avatar-sm rounded-circle">
                            <i class="fa fa-user"></i>
                        </span>
                    </div>
                </a>
                <div class="dropdown-menu dropdown-menu-arrow dropdown-menu-right">
                    <div class=" dropdown-header noti-title">
                        <h6 class="text-overflow m-0">{{ __tr('Welcome!') }}</h6>
                    </div>
                    <a href="{{ route('user.profile.edit') }}" class="dropdown-item">
                        <i class="fa fa-user"></i>
                        <span>{{ __tr('My profile') }}</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <a data-method="post" href="{{ route('auth.logout') }}" class="dropdown-item lw-ajax-link-action">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>{{ __tr('Logout') }}</span>
                    </a>
                </div>
            </li>
        </ul>
        <!-- Collapse -->
        <div class="collapse navbar-collapse" id="sidenav-collapse-main">
            <!-- Collapse header -->
            <div class="navbar-collapse-header d-md-none">
                <div class="row">
                    <div class="col-6 collapse-brand">
                        <a href="{{ url('/') }}">
                            <img src="{{ getAppSettings('logo_image_url') }}">
                        </a>
                    </div>
                    <div class="col-6 collapse-close">
                        <button type="button" class="navbar-toggler" data-toggle="collapse"
                            data-target="#sidenav-collapse-main" aria-controls="sidenav-main" aria-expanded="false"
                            aria-label="Toggle sidenav">
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </div>
            <!-- Navigation -->
            <ul class="navbar-nav">
                @if (hasCentralAccess())
                <li class="nav-item">
                    <a class="nav-link {{ markAsActiveLink('central.console') }}" href="{{ route('central.console') }}">
                        <i class="fa fa-chart-line gradient-icon-1"></i> {{ __tr('Dashboard') }}
                    </a>
                </li>
               
                <li class="nav-item">
                    <a class="nav-link" href="#lwSubscriptionSubMenu" data-toggle="collapse" role="button"
                        aria-expanded="true" aria-controls="lwSubscriptionSubMenu">
                        <i class="fa fa-wallet text-dark gradient-icon-3"></i>
                        <span class="nav-link-text">{{ __tr('User Plans') }}</span>
                    </a>
                    <div class="collapse show lw-expandable-nav" id="lwSubscriptionSubMenu">
                        <ul class="nav nav-sm flex-column">
                            <li class="nav-item {{ markAsActiveLink('central.subscriptions') }}">
                                <a class="bg-primary-light nav-link nav-link-ul" href="{{ route('central.subscriptions') }}">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('Auto') }}
                                </a>
                            </li>
                            <li class="nav-item {{ markAsActiveLink('central.subscription.manual_subscription.read.list_view') }}">
                                <a class="nav-link nav-link-ul bg-primary-light" href="{{ route('central.subscription.manual_subscription.read.list_view') }}">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('Manual/Prepaid') }} @if(getPendingSubscriptionCount())<span class="badge badge-danger ml-2">{{ getPendingSubscriptionCount() }}</span> @endif
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
                
                <li class="nav-item {{ markAsActiveLink('central.vendors') }}">
                    <a class="nav-link" href="{{ route('central.vendors') }}">
                        <i class="fas fa-users gradient-icon-2"></i> {{ __tr('Users') }}
                    </a>
                </li>
                
                <li class="nav-item ">
                    <a class="nav-link {{ markAsActiveLink('page.list') }}" href="{{ route('page.list') }}">
                        <i class="fas fa-copy gradient-icon-4"></i> {{ __tr('Pages') }}
                    </a>
                </li>
                
                <li class="nav-item">
                    <a class="nav-link {{ markAsActiveLink('manage.translations.languages') }}" href="{{ route('manage.translations.languages') }}">
                        <i class="fas fa-globe gradient-icon-5"></i> {{ __tr('Languages') }}
                    </a>
                </li>
                
                <li class="nav-item {{ request('pageType') == 'other' ? 'active' : '' }}">
                    <a class="bg-primary-light nav-link nav-link-footer"
                        href="{{ route('manage.configuration.read', ['pageType' => 'other']) }}">
                        <i class="fa fa-cogs gradient-icon-6" style="color: #6C757D !important;"></i>
                        {!! __tr('Setup') !!}
                    </a>
                </li>
                
                <li class="nav-item {{ request('pageType') == 'whatsapp-onboarding' ? 'active' : '' }}">
                    <a class="bg-primary-light nav-link nav-link-footer"
                        href="{{ route('manage.configuration.read', ['pageType' => 'whatsapp-onboarding']) }}">
                        <i class="fab fa-facebook gradient-icon-8"></i>
                        {!! __tr('Embedded Signup') !!}
                    </a>
                </li>
                
                <li class="nav-item">
                    <a class="nav-link" href="#configurationMenu" data-toggle="collapse" role="button"
                        aria-expanded="true" aria-controls="configurationMenu">
                        <i class="fa fa-tools text-dark gradient-icon-7"></i>
                        <span class="nav-link-text">{{ __tr('Settings') }}</span>
                    </a>

                    <div class="collapse show lw-expandable-nav" id="configurationMenu">
                        <ul class="nav nav-sm flex-column">
                            <li class="nav-item">
                                <a class="bg-primary-light nav-link nav-link-ul {{ request('pageType') == 'general' ? 'active' : '' }}"
                                    href="{{ route('manage.configuration.read', ['pageType' => 'general']) }}">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('General') }}
                                </a>
                            </li>
                            <li class="nav-item {{ request('pageType') == 'user' ? 'active' : '' }}">
                                <a class="bg-primary-light nav-link nav-link-ul"
                                    href="{{ route('manage.configuration.read', ['pageType' => 'user']) }}">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{!! __tr('User') !!}
                                </a>
                            </li>
                            <li class="nav-item {{ request('pageType') == 'currency' ? 'active' : '' }}">
                                <a class="bg-primary-light nav-link nav-link-ul"
                                    href="{{ route('manage.configuration.read', ['pageType' => 'currency']) }}">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('Currency') }}
                                </a>
                            </li>
                            <li class="nav-item {{ markAsActiveLink('manage.configuration.payment') }}">
                                <a class="bg-primary-light nav-link-ul nav-link <?= (isset($pageType) and $pageType == 'payment') ? 'active' : '' ?>"
                                    href="<?= route('manage.configuration.read', ['pageType' => 'payment']) ?>">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('Payments') }}
                                </a>
                            </li>
                            <li class="nav-item {{ markAsActiveLink('manage.configuration.subscription-plans') }}">
                                <a class="bg-primary-light nav-link nav-link-ul" href="{{ route('manage.configuration.subscription-plans') }}">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('User Plans') }}
                                </a>
                            </li>
                            <li class="nav-item {{ request('pageType') == 'email' ? 'active' : '' }}">
                                <a class="bg-primary-light nav-link nav-link-ul"
                                    href="{{ route('manage.configuration.read', ['pageType' => 'email']) }}">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('Email') }}
                                </a>
                            </li>
                            <li class="nav-item {{ request('pageType') == 'social-login' ? 'active' : '' }}">
                                <a class="bg-primary-light nav-link nav-link-ul"
                                    href="{{ route('manage.configuration.read', ['pageType' => 'social-login']) }}">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('Logins') }}
                                </a>
                            </li>
                            <li class="nav-item {{ request('pageType') == 'misc' ? 'active' : '' }}">
                                <a class="bg-primary-light nav-link nav-link-ul"
                                    href="{{ route('manage.configuration.read', ['pageType' => 'misc']) }}">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{!! __tr('Apperance') !!}
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
                
                <!--li class="nav-item <!--?= Request::fullUrl() == route('manage.configuration.read', ['pageType' => 'licence-information']) ? 'active' : '' ?>"-->
                    <!--a class="bg-primary-light nav-link nav-link-footer"  href="<!--?= route('manage.configuration.read', ['pageType' => 'licence-information']) ?>"-->
                        <!--i class="fas fa-shield-alt" style="color: #20C997 !important"></i-->
                        <!--span--><!--?= __tr('License') ?></span-->
                    <!--/a>
                </li---->
                
                @endif
                @if (hasVendorAccess() or hasVendorUserAccess())
                <li class="nav-item">
                    <a class="nav-link {{ markAsActiveLink('vendor.console') }}" href="{{ route('vendor.console') }}">
                        <i class="fa fa-chart-line gradient-icon-1"></i>
                        {{ __tr('Dashboard') }}
                    </a>
                </li>
                 @if (hasVendorAccess('messaging'))
                <li class="nav-item">
                    <a class="nav-link {{ markAsActiveLink('vendor.chat_message.contact.view') }}" href="{{ route('vendor.chat_message.contact.view') }}">
                        <span x-cloak x-show="unreadMessagesCount" class="badge badge-success rounded-pill ml--2" x-text="unreadMessagesCount"></span><i class="fa fa-comments mr-2 gradient-icon-9"></i> <span class="ml--2">{{ __tr('Live Chat') }}</span>
                    </a>
                </li>
                @endif
                @if (hasVendorAccess('manage_templates'))
                <li class="nav-item">
                    <a class="nav-link {{ markAsActiveLink('vendor.whatsapp_service.templates.read.list_view') }}"
                        href="{{ route('vendor.whatsapp_service.templates.read.list_view') }}">
                        <i class="fa fa-layer-group gradient-icon-2"></i>
                        {{ __tr('Templates') }}
                    </a>
                </li>
                @endif
                @if (hasVendorAccess('manage_campaigns'))
                <li class="nav-item">
                    <a class="nav-link {{ markAsActiveLink('vendor.campaign.read.list_view') }}"
                        href="{{ route('vendor.campaign.read.list_view') }}">
                        <i class="fa fa-rocket gradient-icon-4"></i>
                        {{ __tr('Campaigns') }}
                    </a>
                </li>
                @endif
                @if (hasVendorAccess('manage_contacts'))
                <li class="nav-item">
                    <a class="nav-link" href="#vendorContactSubmenuNav" data-toggle="collapse" role="button"
                        aria-expanded="false" aria-controls="vendorContactSubmenuNav">
                        <i class="fa fa-users text-dark gradient-icon-5"></i>
                        <span class="">{{ __tr('Contacts') }}</span>
                    </a>
                <div class="collapse lw-expandable-nav" id="vendorContactSubmenuNav">
                    <ul class="nav nav-sm flex-column">
                        <li class="nav-item">
                            <a class="nav-link nav-link-ul {{ markAsActiveLink('vendor.contact.read.list_view') }}"
                                href="{{ route('vendor.contact.read.list_view') }}">
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('All Contacts') }}
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link nav-link-ul {{ markAsActiveLink('vendor.contact.group.read.list_view') }}"
                                href="{{ route('vendor.contact.group.read.list_view') }}">
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('Contact Groups') }}
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link nav-link-ul {{ markAsActiveLink('vendor.contact.custom_field.read.list_view') }}"
                                href="{{ route('vendor.contact.custom_field.read.list_view') }}">
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('Add Input') }}
                            </a>
                        </li>
                    </ul>
                </div>
            </li>
            @endif
                 @if (hasVendorAccess('manage_bot_replies'))
                 <li class="nav-item">
                    <a class="nav-link" href="#vendorAutomationSubmenuNav" data-toggle="collapse" role="button"
                        aria-expanded="false" aria-controls="vendorAutomationSubmenuNav">
                        <i class="fas fa-brain text-dark gradient-icon-8"></i>
                        <span class="">{{ __tr('Chatbot') }}</span>
                    </a>
                <div class="collapse lw-expandable-nav" id="vendorAutomationSubmenuNav">
                    <ul class="nav nav-sm flex-column">
                        <li class="nav-item">
                            <a class="nav-link nav-link-ul {{ markAsActiveLink('vendor.bot_reply.read.list_view') }}"
                                href="{{ route('vendor.bot_reply.read.list_view') }}">
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('All Chatbots') }}
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link nav-link-ul {{ markAsActiveLink('vendor.bot_reply.bot_flow.read.list_view') }}"
                                href="{{ route('vendor.bot_reply.bot_flow.read.list_view') }}">
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('Flow Maker') }}
                            </a>
                        </li>
                    </ul>
                </div>
            </li>
                @endif
                @if (hasVendorAccess('administrative'))
                <li class="nav-item">
                    <a class="nav-link {{ markAsActiveLink('vendor.user.read.list_view') }}"
                        href="{{ route('vendor.user.read.list_view') }}">
                        <i class="fa fa-user-tie gradient-icon-7"></i>
                        {{ __tr('Agents') }}
                    </a>
                </li>
                @endif
                <li class="nav-item">
                    <a class="nav-link" href="#" data-toggle="modal" data-target="#lwScanMeDialog">
                        <i class="fa fa-qrcode text-dark gradient-icon-3"></i>
                        {{ __tr('QR Code') }}
                    </a>
                </li>
                @if (hasVendorAccess('administrative'))
                <li class="nav-item">
                    <a class="nav-link {{ markAsActiveLink('subscription.read.show') }}"
                        href="{{ route('subscription.read.show') }}">
                        <i class="fa fa-wallet gradient-icon-10"></i>
                        {{ __tr('My Plan') }}
                    </a>
                </li>
                <li class="nav-item">
                        <a class="nav-link @if(isWhatsAppBusinessAccountReady()) collapsed @else text-warning @endif" href="#vendorSettingsNav" data-toggle="collapse" role="button"
                            aria-expanded="@php echo !isWhatsAppBusinessAccountReady() ? 'true' : 'false'; @endphp" aria-controls="vendorSettingsNav">
                            <i class="fa fa-cog gradient-icon-6"></i>
                            <span class="">{{ __tr('Setup') }}</span>
                        </a>
                    <div class="collapse @if(!isWhatsAppBusinessAccountReady()) show @endif lw-expandable-nav" id="vendorSettingsNav">
                        <ul class="nav nav-sm flex-column">
                            <li class="nav-item">
                                <a class="nav-link nav-link-ul <?= (isset($pageType) and $pageType == 'general') ? 'active' : '' ?>"
                                    href="<?= route('vendor.settings.read', ['pageType' => 'general']) ?>">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('Basic') }}
                                </a>
                            </li>
                            <li class="nav-item">
                                <strong><a class="nav-link nav-link-ul <?= (isset($pageType) and $pageType == 'whatsapp-cloud-api-setup') ? 'active' : '' ?> @if(!isWhatsAppBusinessAccountReady()) text-warning @endif"
                                    href="<?= route('vendor.settings.read', ['pageType' => 'whatsapp-cloud-api-setup']) ?>">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ __tr('WhatsApp Setup') }} @if(!isWhatsAppBusinessAccountReady())<i class="fas fa-exclamation-triangle ml-1"></i>@endif
                                </a></strong>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link nav-link-ul <?= (isset($pageType) and $pageType == 'ai-chat-bot-setup') ? 'active' : '' ?>"
                                    href="<?= route('vendor.settings.read', ['pageType' => 'ai-chat-bot-setup']) ?>">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{!! __tr('Chatbot Settings') !!}
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link nav-link-ul <?= (isset($pageType) and $pageType == 'api-access') ? 'active' : '' ?>"
                                    href="<?= route('vendor.settings.read', ['pageType' => 'api-access']) ?>">
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{!! __tr('API Integration') !!}
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
                @endif
                @endif
            </ul>
        </div>
    </div>
</nav>