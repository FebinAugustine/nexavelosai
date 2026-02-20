@extends('layouts.app')
@section('content')
@include('layouts.headers.cards')
@push('head')
<?= __yesset(['dist/css/dashboard.css'],true)?>
@endpush
<style>
    .stats-icon {
        font-size: 25px !important;
        background: linear-gradient(135deg, #afceff, #0861F2); 
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block; 
    }
    .stats-icon-secondary {
        font-size: 25px !important;
        background: linear-gradient(135deg, #abfcf1, #51CBBB); 
        -webkit-background-clip: text; 
        -webkit-text-fill-color: transparent; 
        display: inline-block;
    }
    #dashboard-table td,
    #dashboard-table th {
        font-size: 15px;
    }
</style>
<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            @if (getAppSettings('enable_queue_jobs_for_campaigns'))
                @if (!getAppSettings('queue_setup_done_at'))
                    <div class="alert alert-danger"><i class="fa fa-info-circle"></i> {{  __tr('Queue worker setup is required') }}</div>
                @endif
            @else
                @if (!getAppSettings('cron_setup_done_at'))
                    <div class="alert alert-danger"><i class="fa fa-info-circle"></i> {{  __tr('Cron job setup is required') }}</div>
                @endif
            @endif
            @if (!getAppSettings('pusher_app_id'))
                <div class="alert alert-danger"><i class="fa fa-info-circle"></i> {{  __tr('Pusher configuration is required') }}</div>
            @endif
        </div>
    </div>
    <div class="row">
        <div class="col col-xl-9 mb-5 mb-xl-0">
            <div class="card shadow">
                <div class="card-header bg-transparent">
                    <div class="row align-items-center">
                        <div class="col">
                            <h2 class="mb-0 font-weight-bold text-uppercase" style="color: #0861F2;">{{  __tr('User Onboarding Analytics') }}</h2>
                            <h4 class="text-uppercase ls-1 mb-1 font-weight-bold">{{  __tr('Annual') }}</h4>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Chart -->
                    <div class="chart">
                        <canvas id="lwNewVendorRegistrationGraph" class="chart-canvas" height="300"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="col col-xl-3 mb-5 mb-xl-5">
            <div x-cloak x-data="{totalVendors:{{ $totalVendors }},totalActiveVendors:{{ $totalActiveVendors }},totalCampaigns:{{ $totalCampaigns }},messagesInQueue:{{ $messagesInQueue }},totalContacts:{{ $totalContacts }},totalMessagesProcessed:{{ $totalMessagesProcessed }} }">
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col font-weight-bold h2 text-uppercase text-secondary"> 
                                <i class="fas fa-user stats-icon"></i> {{ __tr('Users') }}
                            </div>
                        </div>
                        <div class="row pl-2">
                            <div class="col">
                                <span class="font-weight-bold h1" style="font-size: 40px;"
                                    x-text="__Utils.formatAsLocaleNumber(totalVendors)"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card mt-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col font-weight-bold h2 text-uppercase text-secondary"> 
                                <i class="fas fa-user-check stats-icon"></i> {{ __tr('Active Users') }}
                            </div>
                        </div>
                        <div class="row pl-2">
                            <div class="col">
                                <span class="font-weight-bold h1" style="font-size: 40px;"
                                    x-text="__Utils.formatAsLocaleNumber(totalActiveVendors)"></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card mt-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col font-weight-bold h2 text-uppercase text-secondary"> 
                                <i class="fas fa-users stats-icon"></i> {{ __tr('Contacts') }}
                            </div>
                        </div>
                        <div class="row pl-2">
                            <div class="col">
                                <span class="font-weight-bold h1" style="font-size: 40px;"
                                    x-text="__Utils.formatAsLocaleNumber(totalContacts)"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 mb-5 mb-xl-5">
            <div x-cloak x-data="{totalVendors:{{ $totalVendors }},totalActiveVendors:{{ $totalActiveVendors }},totalCampaigns:{{ $totalCampaigns }},messagesInQueue:{{ $messagesInQueue }},totalContacts:{{ $totalContacts }},totalMessagesProcessed:{{ $totalMessagesProcessed }} }">
                <div class="row">
                    <div class="col-lg-4 mt-1">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col font-weight-bold h2 text-uppercase text-secondary"> 
                                        <i class="fas fa-rocket stats-icon-secondary"></i> {{ __tr('Overall Campaigns') }}
                                    </div>
                                </div>
                                <div class="row pl-2">
                                    <div class="col">
                                        <span class="font-weight-bold h1" style="font-size: 40px;"
                                            x-text="__Utils.formatAsLocaleNumber(totalCampaigns)"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mt-1">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col font-weight-bold h2 text-uppercase text-secondary"> 
                                        <i class="fas fa-hourglass-half stats-icon-secondary"></i> {{ __tr('Messages In-Process') }}
                                    </div>
                                </div>
                                <div class="row pl-2">
                                    <div class="col">
                                        <span class="font-weight-bold h1" style="font-size: 40px;"
                                            x-text="__Utils.formatAsLocaleNumber(messagesInQueue)"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mt-1">
                        <div class="card">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col font-weight-bold h2 text-uppercase text-secondary"> 
                                        <i class="fas fa-clipboard-check stats-icon-secondary"></i> {{ __tr('Processed Messages') }}
                                    </div>
                                </div>
                                <div class="row pl-2">
                                    <div class="col">
                                        <span class="font-weight-bold h1" style="font-size: 40px;"
                                            x-text="__Utils.formatAsLocaleNumber(totalMessagesProcessed)"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row mt-2">
        <div class="col-xl-12 mb-5 mb-xl-0">
            <div class="card shadow mb-5">
                <div class="card-header border-0">
                    <div class="row align-items-center">
                        <div class="col">
                            <h3 class="mb-0 font-weight-bold text-primary">{{  __tr('Fresh Users') }}</h3>
                        </div>
                        <div class="col text-right">
                            <a href="{{ route('central.vendors') }}" class="btn btn-primary font-weight-bold">{{  __tr('Get List') }}</a>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <!-- Projects table -->
                    <table class="table align-items-center table-flush" id="dashboard-table">
                        <thead class="thead-light">
                            <tr>
                                <th scope="col">{{  __tr('User') }}</th>
                                <th scope="col">{{  __tr('Registered Date') }}</th>
                                <th scope="col">{{  __tr('Status') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($newVendors as $newVendor)
                            <tr>
                                <td scope="row">  <a href="{{ route('vendor.dashboard',['vendorIdOrUid'=>$newVendor->_uid])}}">{{ $newVendor->title }}</a></td>
                                <td>{{ formatDate($newVendor->created_at) }}</td>
                                <td><span class="rounded bg-success p-1 text-white">{{ configItem("status_codes." . $newVendor->status) }}</span></td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    @include('layouts.footers.auth')
</div>
@endsection
@push('js')
<?= __yesset(['dist/js/dashboard.js'],true)?>
@endpush
@push('appScripts')
<script>
        (function($) {
        'use strict';
    var ctx1 = document.getElementById("lwNewVendorRegistrationGraph").getContext("2d");
    var gradientStroke1 = ctx1.createLinearGradient(0, 230, 0, 50);

    gradientStroke1.addColorStop(1, 'rgba(8, 97, 242, 0.5)');
    gradientStroke1.addColorStop(0, 'rgba(175, 206, 255, 0.5)');
    new Chart(ctx1, {
      type: "bar",
      data: {
        labels: @json(array_pluck($vendorRegistrations, 'month_name')),
        datasets: [{
          label: "{{ __tr('New users') }}",
          tension: 0.4,
          borderWidth: 0,
          pointRadius: 0,
          borderColor: "#5e72e4",
          backgroundColor: gradientStroke1,
          borderWidth: 0,
          fill: true,
          data: @json(array_pluck($vendorRegistrations, 'vendors_count')),
          maxBarThickness: 40

        }],
      },
      options: {
        locale : window.appConfig.locale,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          y: {
            grid: {
              drawBorder: false,
              display: true,
              drawOnChartArea: true,
              drawTicks: false,
              borderDash: [5, 5]
            },
            ticks: {
              display: true,
              padding: 10,
              color: '#000'
            }
          },
          x: {
            grid: {
              drawBorder: false,
              display: false,
              drawOnChartArea: false,
              drawTicks: false,
              borderDash: [5, 5]
            },
            ticks: {
              display: true,
              color: '#000',
              padding: 20
            }
          },
        },
      },
    });
})(jQuery);
  </script>
@endpush
