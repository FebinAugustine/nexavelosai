@php
if(!isset($vendorViewBySuperAdmin))
$vendorViewBySuperAdmin = false;
@endphp
@if (hasCentralAccess() and !$vendorViewBySuperAdmin )
<div class="header pb-5 pt-2 pt-md-7">
    <div class="container-fluid">
    </div>
</div>
{{-- show.dropdown.result --}}
@elseif(hasVendorAccess() or hasVendorUserAccess() or $vendorViewBySuperAdmin )
<div class="header">
    <div class="container-fluid">
        <div class="header-body">
            <!-- Card stats -->
            <div class="row pb-0 pt-3 pt-lg-6 d-flex align-items-stretch mt-4 ">
                <div class="col-12 col-xl-3 ">
                    <div class="card text-center" style="background: linear-gradient(135deg, #41C6B5, #1771E6); box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);">
                        <div class="card-body">
                	        <div class="h1 font-weight-bold gridient-icon-1">{{ __tr('Welcome __userFullName__ !!', [ '__userFullName__' => getUserAuthInfo('profile.first_name') ]) }}</div>
                	        <a href="{{ route('subscription.read.show') }}" class="btn bg-white font-weight-bold mt-2 text-dark">View plan</a>
                	        <a href="<?= route('vendor.settings.read', ['pageType' => 'whatsapp-cloud-api-setup']) ?>" class="btn bg-white font-weight-bold mt-2 text-dark">API Setup</a>
            	        </div>
            	    </div>
        	    </div>
        	    <div class="col-12 col-xl-9 mt-2 mt-xl-0">
        	        <div class="card h-100">
                        <div class="card-body row d-flex align-items-center">
                            <div class="col-6 col-lg-2 mt-2 mt-lg-0">
                                <div class="text-primary rounded text-center" style="background-color: #e3edf7;">
                                    <span x-cloak x-show="unreadMessagesCount" class="position-absolute bg-success text-white pl-1 pr-1 rounded font-weight-bold" x-text="unreadMessagesCount" style="right:10%;"></span>
                                    <a href="{{ route('vendor.chat_message.contact.view') }}" style=" font-size: 50px;"><i class="fas fa-comments gradient-icon-lg-9"></i></a>
                                    <div class="font-weight-bold text-dark">Live Chat</div>
                                </div>
                            </div>
                            <div class="col-6 col-lg-2 mt-2 mt-lg-0">
                                <div class="text-primary rounded text-center" style="background-color: #e3edf7;">
                                    <span class="position-absolute bg-success text-white pl-1 pr-1 rounded font-weight-bold" style="right:10%;">{{ __tr($totalTemplates) }}</span>
                                    <a href="{{ route('vendor.whatsapp_service.templates.read.list_view') }}" style=" font-size: 50px;"><i class="fa fa-layer-group gradient-icon-lg-2"></i></a>
                                    <div class="font-weight-bold text-dark">Template</div>
                                </div>
                            </div>
                            <div class="col-6 col-lg-2 mt-2 mt-lg-0">
                                <div class="text-primary rounded text-center" style="background-color: #e3edf7;">
                                    <span class="position-absolute bg-success text-white pl-1 pr-1 rounded font-weight-bold" style="right:10%;">{{ __tr($totalCampaigns) }}</span>
                                    <a href="{{ route('vendor.campaign.read.list_view') }}" style=" font-size: 50px;"><i class="fa fa-rocket gradient-icon-lg-4"></i></a>
                                    <div class="font-weight-bold text-dark">Campaign</div>
                                </div>
                            </div>
                            <div class="col-6 col-lg-2 mt-2 mt-lg-0">
                                <div class="text-primary rounded text-center" style="background-color: #e3edf7;">
                                    <span class="position-absolute bg-success text-white pl-1 pr-1 rounded font-weight-bold" style="right:10%;">{{ __tr($totalContacts) }}</span>
                                    <a href="{{ route('vendor.contact.read.list_view') }}" style=" font-size: 50px;"><i class="fa fa-users gradient-icon-lg-5"></i></a>
                                    <div class="font-weight-bold text-dark">Contacts</div>
                                </div>
                            </div>
                            <div class="col-6 col-lg-2 mt-2 mt-lg-0">
                                <div class="text-primary rounded text-center" style="background-color: #e3edf7;">
                                    <span class="position-absolute bg-success text-white pl-1 pr-1 rounded font-weight-bold" style="right:10%;">{{ __tr($totalBotReplies) }}</span>
                                    <a href="{{ route('vendor.bot_reply.read.list_view') }}" style=" font-size: 50px;"><i class="fas fa-brain gradient-icon-lg-8"></i></a>
                                    <div class="font-weight-bold text-dark">Bot Reply</div>
                                </div>
                            </div>
                            <div class="col-6 col-lg-2 mt-2 mt-lg-0">
                                <div class="text-primary rounded text-center" style="background-color: #e3edf7;">
                                    <span class="position-absolute bg-success text-white pl-1 pr-1 rounded font-weight-bold" style="right:10%;">{{ __tr($activeTeamMembers) }}</span>
                                    <a href="{{ route('vendor.user.read.list_view') }}" style=" font-size: 50px;"><i class="fa fa-user-tie gradient-icon-lg-7"></i></a>
                                    <div class="font-weight-bold text-dark">Agents</div>
                                </div>
                            </div>
                        </div>
                    </div>
        	    </div>
            </div>
        </div>
    </div>
</div>
<div class="container-fluid">
    <div class="row mt-4 d-flex align-items-stretch">
        <div class="col-xl-5">
            <div class="card h-100">
                <div class="card-body">
                        <canvas id="donutChart" width="400" height="400" style="max-height:250px;"></canvas>
                </div>
            </div>
        </div>
        <div class="col-xl-7 d-flex align-items-center mt-4 mt-xl-0">
            <div class="card h-100 w-100">
                <div class="card-body row">
                    <div class="col-6">
                    @if (!empty(getVendorSettings('whatsapp_phone_numbers')))
                    @foreach (getVendorSettings('whatsapp_phone_numbers') as $whatsappPhoneNumber)
                        <div class="text-center">
                            <img class="lw-qr-image" src="{{ route('vendor.whatsapp_qr', [
                            'vendorUid' => getVendorUid(),
                            'phoneNumber' => cleanDisplayPhoneNumber($whatsappPhoneNumber['display_phone_number']),
                        ]) }}">
                            <div class="h2 text-dark font-weight-bold">{{ $whatsappPhoneNumber['verified_name'] }}</div>
                            <div class="h3 text-primary font-weight-bold">{{ $whatsappPhoneNumber['display_phone_number'] }}</div>
                        </div>
                    @endforeach
                    @endif
                    </div>
                    <div class="col-6">
                        <div class="mb-2"><a href="{{ route('vendor.whatsapp_service.templates.read.new_view') }}"><div class="font-weight-bold text-center text-white p-1" style=" background: linear-gradient(90deg,  #9eefe6, #2dbcab); border: 1px solid #9DA1A5; border-radius: 50vh;">Create New Template</div></a></div>
                        <div class="mb-2"><a href="{{ route('vendor.campaign.new.view') }}"><div class="font-weight-bold text-center text-white p-1" style="background: linear-gradient(45deg, #F19946, #E34F95); border: 1px solid #9DA1A5; border-radius: 50vh;">Create New Campaign</div></a></div>
                        <div class="mb-2"><a href="{{ route('vendor.contact.read.list_view') }}"><div class="font-weight-bold text-center text-white p-1" style="background: linear-gradient(135deg, #1765C9, #55BFF0); border: 1px solid #9DA1A5; border-radius: 50vh;">Create New Contact</div></a></div>
                        <div class="mb-2"><a href="{{ route('vendor.user.read.list_view') }}"><div class="font-weight-bold text-center text-white p-1" style="background: linear-gradient(135deg, #c4c4c4, #6C757D); border: 1px solid #9DA1A5; border-radius: 50vh;">Create New Agent</div></a></div>
                        <div class="mb-2"><a href="{{ route('vendor.bot_reply.read.list_view') }}"><div class="font-weight-bold text-center text-white p-1" style="background: linear-gradient(135deg, #b5d1ff, #0866FF); border: 1px solid #9DA1A5; border-radius: 50vh;">Create New Chatbot</div></a></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="container-fluid p-3 mt-2">
    <div class="row d-flex align-items-stretch">
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body d-flex justify-content-between">
                    <div style="font-size:20px;">
                        Total<br><span class="font-weight-bold text-primary" style="font-size:30px;">{{ __tr($totalMessagesProcessed + $messagesInQueue) }}</span><span class="font-weight-bold text-primary"> Messages</span>
                    </div>
                    <div class="m-3"><i class="fas fa-clipboard-check gradient-icon-lg-8" style="font-size:50px; opacity: 0.5;"></i></div>
                </div>
            </div>
        </div>
        <div class="col-md-4 mt-2 mt-md-0">
            <div class="card h-100">
                <div class="card-body d-flex justify-content-between">
                    <div style="font-size:20px;">
                        Sent<br><span class="font-weight-bold text-success" style="font-size:30px;">{{ __tr($totalMessagesProcessed) }}</span><span class="font-weight-bold text-success"> Messages</span>
                    </div>
                    <div class="m-3"><i class="fas fa-paper-plane gradient-icon-lg-9" style="font-size:50px; opacity: 0.5;"></i></div>
                </div>
            </div>
        </div>
        <div class="col-md-4 mt-2 mt-md-0">
            <div class="card h-100">
                <div class="card-body d-flex justify-content-between">
                    <div style="font-size:20px;">
                        Pending<br><span class="font-weight-bold text-muted" style="font-size:30px;">{{ __tr($messagesInQueue) }}</span><span class="font-weight-bold text-muted"> Messages</span>
                    </div>
                    <div class="m-3"><i class="fas fa-hourglass-half gradient-icon-lg-7" style="font-size:50px; opacity: 0.5;"></i></div>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    document.addEventListener("DOMContentLoaded", function () {
        // Get the chart canvas
        const ctx = document.getElementById('donutChart').getContext('2d');

        // Create a linear gradient for the chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "#0861F2");
        gradient.addColorStop(1, "#4C9FFD");

        // Data for the chart
        const data = {
            labels: ['Sent Messages', 'Pending Messages'],
            datasets: [{
                data: [ {{ $totalMessagesProcessed }} , {{ $messagesInQueue }} ], // Replace with your dynamic values
                backgroundColor: [gradient, '#e3edf7'], // Gradient + static color
                hoverBackgroundColor: [gradient, '#d9e6f2'], // Hover effects
                borderWidth: 1,
            }]
        };

        // Chart configuration
        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + context.raw + '%';
                            }
                        }
                    }
                },
                cutout: '70%', // Inner radius for the donut
            }
        };

        // Render the chart
        new Chart(ctx, config);
    });
</script>
@endif