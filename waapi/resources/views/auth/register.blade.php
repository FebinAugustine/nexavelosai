@extends('layouts.app', ['class' => 'main-content-has-bg'])

@section('content')
@include('layouts.headers.guest')
<style>
    .gradient-icon-1 {
        background: linear-gradient(135deg, #41C6B5, #1771E6); 
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .demo{ 
        background: #F2F2F2; 
    }
    .form-container{
        background: #ecf0f3;
        font-family: 'Nunito', sans-serif;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 14px 14px 20px #cbced1, -14px -14px 20px white;
    }
    .form-container .form-icon{
        color: #ac40ab;
        font-size: 55px;
        text-align: center;
        line-height: 100px;
        width: 100px;
        height:100px;
        margin: 0 auto 15px;
        border-radius: 50px;
        box-shadow: 7px 7px 10px #cbced1, -7px -7px 10px #fff;
    }
    .form-container .title{
        color: #ac40ab;
        font-size: 25px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        text-align: center;
        margin: 0 0 20px;
    }
    .form-container .form-horizontal .form-group{ margin: 0 0 25px 0; }
    .form-container .form-horizontal .form-group label{
        font-size: 15px;
        font-weight: 600;
        text-transform: uppercase;
    }
    .form-container .form-horizontal .form-control{
        color: #333;
        background: #ecf0f3;
        font-size: 15px;
        height: 50px;
        padding: 20px;
        letter-spacing: 1px;
        border: none;
        border-radius: 50px;
        box-shadow: inset 6px 6px 6px #cbced1, inset -6px -6px 6px #fff;
        display: inline-block;
        transition: all 0.3s ease 0s;
    }
    .form-container .form-horizontal .form-control:focus{
        box-shadow: inset 6px 6px 6px #cbced1, inset -6px -6px 6px #fff;
        outline: none;
    }
    .form-container .form-horizontal .form-control::placeholder{
        color: #808080;
        font-size: 14px;
    }
    .form-container .form-horizontal .btn{
        color: #000;
        background-color: #ac40ab;
        font-size: 15px;
        font-weight: bold;
        text-transform: uppercase;
        width: 100%;
        padding: 12px 15px 11px;
        border-radius: 20px;
        box-shadow: 6px 6px 6px #cbced1, -6px -6px 6px #fff;
        border: none;
        transition: all 0.5s ease 0s;
    }
    .form-container .form-horizontal .btn:hover,
    .form-container .form-horizontal .btn:focus{
        color: #fff;
        letter-spacing: 3px;
        box-shadow: none;
        outline: none;
    }
    .btn{
        color: #000;
        background-color: #ac40ab;
        font-size: 15px;
        font-weight: bold;
        text-transform: uppercase;
        width: 100%;
        padding: 12px 15px 11px;
        border-radius: 20px;
        box-shadow: 6px 6px 6px #cbced1, -6px -6px 6px #fff;
        border: none;
        transition: all 0.5s ease 0s;
    }
</style>
<div class="form-bg">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-md-offset-6">
                <div class="form-container">
                    <div class="form-icon"><i class="fas fa-briefcase gradient-icon-1"></i></div>
                    <h3 class="title" style="color: #0482FF;">Register</h3>
                    <div class="form-horizontal">
                    @if(getAppSettings('enable_vendor_registration'))
                    @php
                    $formSignUpRoute = route('auth.register.process');
                    if (getAppSettings('activation_required_for_new_user')) {
                    $formSignUpRoute = route('activation_required.auth.register.process');
                    }
                    @endphp
                    <x-lw.form :action="$formSignUpRoute" data-secured="true">
                        <div class="form-horizontal">
                        <!-- Vendor Name -->
                        <div class="form-group">
                            <label>Vendor/Company Name</label>
                            <input class="form-control" placeholder="{{ __tr('Vendor/Company Name') }}" type="text"
                                    name="vendor_title" value="{{ old('vendor_title') }}" required autofocus>
                        </div>
                        <!-- Username -->
                        <div class="form-group">
                            <label>Admin Username</label>
                            <input class="form-control" placeholder="{{ __tr('Admin Username') }}" type="text"
                                    name="username" value="{{ old('username') }}" required autofocus>
                        </div>
                        <label style="font-size: 15px; font-weight: 600; text-transform: uppercase;">Name</label>
                        <div class="row">
                            <div class="col-md-6">
                                <!-- First Name -->
                                <div class="form-group">
                                    <input class="form-control" placeholder="{{ __tr('First Name') }}" type="text"
                                        name="first_name" value="{{ old('first_name') }}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <!-- Last Name -->
                                <div class="form-group">
                                    <input class="form-control" placeholder="{{ __tr('Last Name') }}" type="text"
                                            name="last_name" value="{{ old('last_name') }}" required>
                                </div>
                            </div>
                        </div>
                        <!-- mobile no -->
                        <div class="form-group">
                            <label>Mobile Number</label>
                            <input class="form-control" placeholder="{{ __tr('Mobile Number') }}" type="text"
                                    name="mobile_number" value="{{ old('mobile_number') }}" required autofocus>
                            <h5><span>{{__tr("Mobile number should be with country code without 0 or +")}}</span></h5>
                        </div>
                        <!-- /mobile no -->
                        <!-- Email address -->
                        <div class="form-group">
                            <label>email</label>
                            <input class="form-control" placeholder="{{ __tr('Email') }}" type="email" name="email"
                                    value="{{ old('email') }}" required>
                        </div>
                        <!-- Password -->
                        <div class="form-group">
                            <label>password</label>
                            <input class="form-control" placeholder="{{ __tr('Password') }}" type="password"
                                    name="password" required>
                        </div>
                        <!-- Confirm Password -->
                        <div class="form-group">
                            <label>confirm password</label>
                            <input class="form-control" placeholder="{{ __tr('Confirm Password') }}" type="password"
                                    name="password_confirmation" required>
                        </div>
                        <!-- privacy policy -->
                        @if (getAppSettings('user_terms') or getAppSettings('vendor_terms') or getAppSettings('privacy_policy'))
                        <div class="row my-4">
                            <div class="col-12">
                                <div class="custom-control custom-control-alternative custom-checkbox">
                                    <input class="custom-control-input" name="terms_and_conditions" id="itemsAccept"
                                        type="checkbox">
                                    <label class="custom-control-label" for="itemsAccept">
                                        <span class="text-primary">{{ __tr('I agree with the') }}
                                            @if (getAppSettings('user_terms'))
                                            <a class="text-success" href="{{ route('app.terms_and_policies', [
                                                'contentName' => 'user_terms'
                                            ]) }}">{{ __tr('User Terms And Conditions') }}</a>,
                                            @endif
                                            @if (getAppSettings('vendor_terms'))
                                            <a class="text-success" href="{{ route('app.terms_and_policies', [
                                                'contentName' => 'vendor_terms'
                                            ]) }}">{{ __tr('Vendor Terms And Conditions') }}</a>,
                                            @endif
                                            @if (getAppSettings('privacy_policy'))
                                            <a class="text-success" href="{{ route('app.terms_and_policies', [
                                                'contentName' => 'privacy_policy'
                                            ]) }}">{{
                                                __tr('Privacy Policy')
                                                }}</a>
                                            @endif
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        @endif
                        <!-- create account action -->
                        <div class="text-center">
                            <center>
                                <button  type="submit" class="btn btn-success btn-lg btn-block mt-6  mb-5" style="background: linear-gradient(135deg, #41C6B5, #1771E6);"><strong>{{ __tr('Create Account') }}</strong></button>
                            </center>
                        </div>
                    </x-lw.form>
                </div>
                <!-- social login links -->
                @if(getAppSettings('allow_google_login'))
                <a href="<?= route('login.google') ?>" class="btn btn-google btn-user btn-block">
                    <i class="fab fa-google fa-fw"></i> <?= __tr('Continue with Google')  ?>
                </a>
                @endif
                @if(getAppSettings('allow_facebook_login'))
                <a href="<?= route('login.facebook') ?>" class="btn btn-facebook btn-user btn-block">
                    <i class="fab fa-facebook-f fa-fw"></i> <?= __tr('Continue with Facebook')  ?>
                </a>
                @endif
                <!-- social login links -->
                <center>
                    <div class="mb-3 mt-5">
                        {{ __tr('Already have an Account?') }}
                    </div>
                    <a href="{{ route('auth.login') }}" class="btn btn-success my-4 btn-lg btn-block mb-5">
                        <strong>{{ __tr('Click here to login') }}</strong>
                    </a>
                </center>
            </div>
            @else
            <div class="card lw-form-card-box shadow border-0">
                <div class="card-header text-center">
                    @if (getAppSettings('message_for_disabled_registration'))
                    {!! getAppSettings('message_for_disabled_registration') !!}
                @else
                {{ __tr('Vendor Registrations are closed now.') }}
                    @endif
                </div>
            </div>
            @endif
        </div>
    </div>
</div>
@endsection