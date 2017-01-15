# share-js
Javascript social sharing implementation supporting Bit.ly link shortening

## Usage

### Share.init
If you would like to enable Bit.ly link shortening, you can initizalize Share.js using this method.

```
    Share.init({bitly_token: 'MY_BITLY_OAUTH_TOKEN'});
    Share.show('facebook');
```
The resulting URL is now shortened!

### Share.show

The only required parameter to Share.show is the provider key. Currently supported providers are `facebook`, `twitter`, `linkedin`, `pinterest`, and `googleplus`.

Optionally, you can set the following parameters to override inferred values from OpenGraph tags present on the current page:

- `title` - The page title/name of the link that will be shared.
- `description`
- `image` - The image to be included in the preview
- `params` - Key-values to append to the URL (GA campaign, etc)
- `url` - Override the URL
