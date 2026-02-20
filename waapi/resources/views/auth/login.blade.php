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
                    <div class="form-icon"><i class="fa fa-user gradient-icon-1"></i></div>
                    <h3 class="title" style="color: #0482FF;">Login</h3>
                @if (isDemo())
                    <button onclick="document.getElementById('lwLoginEmail').value='demosuperadmin';document.getElementById('lwLoginPassword').value='demopass12';" class="btn btn-sm btn-danger">{{  __tr('Demo Super Admin Login') }}</button>
                    <button onclick="document.getElementById('lwLoginEmail').value='testcompany';document.getElementById('lwLoginPassword').value='demopass12';" class="btn btn-sm btn-danger">{{  __tr('Demo Company Login') }}</button>
                @endif
                    <x-lw.form id="lwLoginForm" data-secured="true" :action="route('auth.login.process')">
                        <div class="form-horizontal">
                            <div class="form-group{{ $errors->has('email') ? ' has-danger' : '' }}">
                                <label>email</label>
                                <input id="lwLoginEmail" class="form-control{{ $errors->has('email') ? ' is-invalid' : '' }}" placeholder="{{ __tr(' Username or Email or Mobile Number') }}" type="text" name="email" value="" required autofocus autocomplete="email">
                                <h5><span class="text-light">{{__tr("Mobile number should be with country code without 0 or +")}}</span></h5>
                            </div>
                            <div class="form-group{{ $errors->has('password') ? ' has-danger' : '' }}">
                                <label>password</label>
                                <input id="lwLoginPassword" class="form-control{{ $errors->has('password') ? ' is-invalid' : '' }}" name="password" placeholder="{{ __tr('Password') }}" type="password" value="" required autocomplete="current-password">
                            </div>
                            <div class="custom-control custom-control-alternative custom-checkbox">
                                <input class="custom-control-input" name="remember" id="customCheckLogin" type="checkbox" {{ old('remember') ? 'checked' : '' }}>
                                <label class="custom-control-label" for="customCheckLogin">
                                    <span class="text-light">{{ __tr('Remember me') }}</span>
                                </label>
                                @if (Route::has('auth.password.request'))
                                <a href="{{ route('auth.password.request') }}" class="text-light float-right">
                                    <small>{{ __tr('Forgot password?') }}</small>
                                </a>
                                @endif
                            </div>
                            <div class="text-center">
                                <center>
                                    <button type="submit" class="btn btn-success my-4 btn-lg btn-block mb-5" style=" background: linear-gradient(135deg, #41C6B5, #1771E6);"><strong>{{ __tr('Login') }}</strong></button>
                                </center>
                            </div>
                    </x-lw.form>
                </div>
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
                @if(getAppSettings('enable_vendor_registration'))
                <!-- social login links -->
                <div class="mb-3 mt-5">
                    {{  __tr('If you don\'t have an Account yet? Create One! Its Free!!') }}
                </div>
                <center>
                    <a href="{{ route('auth.register') }}" class="btn btn-success my-4 btn-lg btn-block mb-5" style="  background: linear-gradient(135deg, #22D571, #00bc51);">
                        <strong>{{ __tr('Create New Account') }}</strong>
                    </a>
                </center>
                @elseif(getAppSettings('message_for_disabled_registration'))
                <div class="mb-3 mt-5">
                    {{  __tr('Want to create New Account?') }}
                </div>
                <a href="{{ route('auth.register') }}" class="btn btn-lg btn-warning">
                    <small>{{ __tr('More Info') }}</small>
                </a>
                @endif
            </div>
        </div>
    </div>
</div>
</div>
@endsection