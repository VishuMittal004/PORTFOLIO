// Enhanced Contact Form Handler for EmailJS
(function($) {
    'use strict';

    const ContactForm = {
        init: function() {
            this.form = $('#contact-form');
            this.submitBtn = $('#submit');
            this.formMessages = $('#form-messages');
            this.bindEvents();
            this.setupValidation();
        },

        bindEvents: function() {
            this.form.on('submit', this.handleSubmit.bind(this));
            this.form.on('input', this.handleInput.bind(this));
            this.form.on('blur', this.handleBlur.bind(this));
        },

        setupValidation: function() {
            // Real-time validation
            this.form.find('input, textarea').on('input', function() {
                ContactForm.validateField($(this));
            });
        },

        validateField: function(field) {
            const value = field.val().trim();
            const fieldName = field.attr('name');
            const errorClass = 'field-error';
            const successClass = 'field-success';

            // Remove existing error/success classes
            field.removeClass(errorClass + ' ' + successClass);
            this.removeFieldError(field);

            let isValid = true;
            let errorMessage = '';

            switch(fieldName) {
                case 'name':
                    if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Name must be at least 2 characters long';
                    }
                    break;

                case 'email':
                    const emailRegex = /^[^\s@]+@[^-\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;

                case 'phone':
                    // Clean the phone number (remove spaces, dashes, etc.)
                    const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
                    const phoneRegex = /^[0-9]{10,15}$/;
                    if (!phoneRegex.test(cleanPhone)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number (10-15 digits)';
                    } else {
                        // Update the field with cleaned value
                        field.val(cleanPhone);
                    }
                    break;

                case 'message':
                    if (value.length < 10) {
                        isValid = false;
                        errorMessage = 'Message must be at least 10 characters long';
                    }
                    break;
            }

            if (value === '') {
                isValid = false;
                errorMessage = 'This field is required';
            }

            if (isValid) {
                field.addClass(successClass);
            } else {
                field.addClass(errorClass);
                this.showFieldError(field, errorMessage);
            }

            return isValid;
        },

        showFieldError: function(field, message) {
            const errorDiv = $('<div class="field-error-message">' + message + '</div>');
            field.after(errorDiv);
        },

        removeFieldError: function(field) {
            field.siblings('.field-error-message').remove();
        },

        handleInput: function(e) {
            const field = $(e.target);
            this.validateField(field);
        },

        handleBlur: function(e) {
            const field = $(e.target);
            this.validateField(field);
        },

        validateForm: function() {
            let isValid = true;
            const requiredFields = this.form.find('input[required], textarea[required]');
            
            requiredFields.each(function() {
                if (!ContactForm.validateField($(this))) {
                    isValid = false;
                }
            });

            return isValid;
        },

        handleSubmit: function(e) {
            e.preventDefault();
            
            if (!this.validateForm()) {
                // Only show validation error, not generic error
                this.showMessage('Please correct the errors above.', 'error');
                return false; // Ensure form does not submit if invalid
            }

            // Prevent double submission
            if (this.submitBtn.prop('disabled')) {
                return false;
            }

            // FIX: Clear previous messages before showing loading state
            this.clearMessages();
            this.setLoadingState(true);
            this.showMessage('Sending your message...', 'success');

            // Prepare email data
            const templateParams = {
                from_name: this.form.find('#contact-name').val(),
                from_email: this.form.find('#contact-email').val(),
                from_phone: this.form.find('#contact-phone').val(),
                subject: this.form.find('#subject').val() || 'Portfolio Contact',
                message: this.form.find('#contact-message').val(),
                to_email: 'vipanshucareer@gmail.com'
            };

            // Send main email to you
            emailjs.send('service_uobiro9', 'template_6rheieg', templateParams)
                .then((response) => {
                    // Send auto-reply to user (with user's email as recipient)
                    const autoReplyParams = {
                        to_email: templateParams.from_email,
                        from_name: templateParams.from_name,
                        from_email: templateParams.from_email,
                        from_phone: templateParams.from_phone,
                        subject: 'Thank you for contacting me - Vipanshu Mittal',
                        message: templateParams.message
                    };
                    
                    emailjs.send('service_uobiro9', 'template_csab1hd', autoReplyParams)
                        .then((autoReplyRes) => {
                            // Auto-reply sent successfully
                        }, (autoReplyErr) => {
                            // Auto-reply failed, but don't show error to user
                            console.log('Auto-reply failed:', autoReplyErr);
                        });
                    
                    this.showMessage('Thank you! Your message has been sent successfully. I will get back to you soon.', 'success');
                    this.form[0].reset();
                    this.form.find('input, textarea').removeClass('field-success field-error');
                    this.form.find('.field-error-message').remove();
                    this.setLoadingState(false);
                }, (error) => {
                    // Only show error message here!
                    this.showMessage('Sorry, there was an error sending your message. Please try again.', 'error');
                    this.setLoadingState(false);
                });
        },

        showMessage: function(message, type) {
            const messageClass = type === 'success' ? 'success' : 'error';
            const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
            
            this.formMessages.html(`
                <div class="form-message ${messageClass}">
                    <i class="fa ${icon}"></i>
                    <span>${message}</span>
                </div>
            `);
            
            this.formMessages.fadeIn();
        },

        clearMessages: function() {
            this.formMessages.empty().hide();
        },

        setLoadingState: function(loading) {
            const btnText = this.submitBtn.find('.btn-text');
            const originalText = btnText.data('original-text') || 'Connect Now';
            
            if (loading) {
                btnText.data('original-text', btnText.text());
                btnText.html('<i class="fa fa-spinner fa-spin"></i> Sending...');
                this.submitBtn.prop('disabled', true);
            } else {
                btnText.text(originalText);
                this.submitBtn.prop('disabled', false);
            }
        }
    };

    // Initialize when document is ready
    $(document).ready(function() {
        ContactForm.init();
    });

})(jQuery); 
