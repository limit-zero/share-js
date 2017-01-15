/**
 * Share.js
 * A unified library for displaying a Share UI for social providers.
 * Enforces link shortening with Bitly
 *
 * @author      Josh Worden <josh@limit0.io>
 * @requires    jQuery
 *
 * Usage:
 *
 * Initial configuration:
 * Share.init({bitly_token: 'MY_BITLY_OAUTH_TOKEN'});
 *
 * Show facebook share for current page
 * Share.show('facebook')
 */

var Share = (function () {

    /**
     * @var object
     */
    var defaults = {
        bitly_token: '',
    };

    /**
     * @var string
     */
    var url,
        provider,
        shortUrl,
        title,
        description,
        image
    ;

    /**
     * Initializer. Allows injection of configuration options
     *
     * @access public
     *
     */
    function init(options) {
        var options = $.extend(defaults, options);
    }
    /**
     * Shows the Share popup
     *
     * @access public
     *
     * @param string provider       Required: One of ['facebook','twitter','linkedin','pinterest','googleplus']
     * @param string title          Optional: The 'title' text to send to the provider
     * @param string description    Optional: The 'description' text to send to the provider
     * @param string image          Optional: The image URL to send to the provider.
     * @param object params         Optional: Key-values to append to the URL ({foo: 'bar', test: 1245})
     * @param string url            Optional: The URL to share. Defaults to current URL ('http://bit.ly/1234')
     *
     * @return windowObjectReference    The popup window
     */
    function show(provider, title, description, image, params, url) {

        // Build URL
        url = buildUrl(url, params);

        // Handle link shortening
        if (defaults.bitly_token !== '') {
            return showPopupAsync(url, provider, title, description, image);
        }

        // Display popup normally
        var longUrl = buildProviderUrl(url, provider, title, description, image);
        return showPopup(longUrl);
    }

    /**
     * Appends additional key-values to the URL
     *
     * @access private
     *
     * @param  string url           The URL to modify
     * @param  object params        Key-values to append to the URL
     *
     * @return string
     */
    function buildUrl(link, params) {

        // If not specified, use the current URL
        if (typeof link === 'undefined') {
            link = window.location.href;
        }

        if (!jQuery.isEmptyObject(params)) {

            if (link.indexOf('?') >= 0) {
                link = link + '&';
            } else {
                link = link + '?';
            }

            for (key in params) {
                link = link + key + '=' + encodeURIComponent(params[key]) + '&';
            }

            // strip trailing &
            link = link.replace(/&$/, '');

        }

        return link;
    }

    /**
     * Builds a provider-specific share URL based on passed parameters.
     *
     * @access private
     *
     * @param  string url
     * @param  string provider
     * @param  string title
     * @param  string description
     * @param  string image
     *
     * @return string
     */
    function buildProviderUrl(link, provider, title, description, image) {
        switch (provider) {
            case 'facebook':
                return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link);
            case 'twitter':
                return 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(title);
            case 'google-plus':
                return 'https://plus.google.com/share?url=' + encodeURIComponent(link);
            case 'linkedin':
                return 'http://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(link) + '&title=' + encodeURIComponent(title) + '&summary=' + encodeURIComponent(description);
            case 'pinterest':
                return 'https://www.pinterest.com/pin/create/button/?url=' + encodeURIComponent(link) + '&media=' + encodeURIComponent(image) + '&description=' + encodeURIComponent(description);
        }
        return false;
    }

    /**
     * Shows the Share popup
     *
     * @access private
     *
     * @param string shareUrl       The provider URL to display
     *
     * @return windowObjectReference    The popup window
     */
    function showPopup(shareUrl) {

        if (shareUrl === false) {
            return false;
        }

        // Popup location
        var
            px = Math.floor(((screen.availWidth || 1024) - 500) / 2),
            py = Math.floor(((screen.availHeight || 700) - 500) / 2);

        // open popup
        var popup = window.open(shareUrl, "social",
            "width=" + 500 + ",height=" + 500 +
            ",left=" + px + ",top=" + py +
            ",location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1");

        if (popup) {
            popup.focus();
        }
        return popup;
    }

    /**
     * Displays share popup with shortened URL
     *
     * @access private
     *
     * @param  string url           The long URL
     * @param  string provider      The provider key to use
     * @param  string title
     * @param  string description
     * @param  string image
     *
     * @return windowObjectReference    The popup window
     */
    function showPopupAsync(link, provider, title, description, image) {

        // Last check for non-shortening
        if (defaults.bitly_token == '') {
            var longUrl = buildProviderUrl(link, provider, title, description, image);
            return showPopup(longUrl);
        }

        // Send the shorten request
        var promise = $.ajax('https://api-ssl.bitly.com/v3/shorten?access_token='+defaults.bitly_token+'&longUrl='+ encodeURIComponent(link));

        // Display the initial empty share popup.
        popup = showPopup('about:blank');

        var interval = window.setInterval(function() {
            if (promise.readyState === 4) {
                if (promise.status === 200) {
                    shortUrl = promise.responseJSON.data.url;
                    link = buildProviderUrl(shortUrl, provider, title, description, image);
                } else {
                    console.log('An error was encountered shortening your link. Falling back to full link.');
                    link = buildProviderUrl(link, provider, title, description, image);
                }
                popup.location.replace(link);
                window.clearInterval(interval);
            }
        }, 50);
    }

    return {
        init: init,
        show: show
    }

})();
