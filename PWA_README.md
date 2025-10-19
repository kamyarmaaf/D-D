# D&D Bolt - PWA Configuration

## Progressive Web App Features

### ✅ Installed
- **Installable**: Users can install the app on their devices
- **Standalone**: Runs in full-screen mode without browser UI
- **Offline Support**: Works without internet connection

### ✅ Performance
- **Service Worker**: Caches resources for offline use
- **Fast Loading**: Optimized assets and caching strategies
- **Responsive**: Works on all device sizes

### ✅ User Experience
- **App-like**: Feels like a native mobile app
- **Splash Screen**: Custom loading screen
- **Home Screen Icon**: Beautiful D&D-themed icon
- **Push Notifications**: Ready for future implementation

## Installation Instructions

### For Users:
1. Visit [https://dand.zer0team.ir/](https://dand.zer0team.ir/)
2. Look for the "Install" button in your browser
3. Click "Install" to add to home screen
4. Enjoy the full app experience!

### For Developers:
1. Run `npm run build` to build the project
2. Deploy the `dist` folder to your server
3. Ensure HTTPS is enabled (required for PWA)
4. Test installation on different devices

## PWA Files

- `public/manifest.json` - PWA manifest
- `public/manifest.webmanifest` - Alternative manifest format
- `public/icons/icon.svg` - App icon
- `public/robots.txt` - SEO configuration
- `public/sitemap.xml` - Site map
- `public/.htaccess` - Server configuration
- `src/components/PWAInstallPrompt.tsx` - Install prompt component

## Browser Support

- ✅ Chrome (Android/Desktop)
- ✅ Edge (Windows/Android)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Android/Desktop)
- ✅ Samsung Internet

## Testing PWA

1. **Lighthouse**: Run PWA audit
2. **Chrome DevTools**: Check Application tab
3. **Mobile Testing**: Test on actual devices
4. **Offline Testing**: Disconnect internet and test

## Customization

### Icon
- Edit `public/icons/icon.svg` to change the app icon
- Ensure it's 512x512px for best quality

### Manifest
- Edit `public/manifest.json` to customize app details
- Update colors, name, description, etc.

### Install Prompt
- Edit `src/components/PWAInstallPrompt.tsx` to customize the prompt
- Change styling, text, or behavior

## Troubleshooting

### Installation Not Working
- Ensure HTTPS is enabled
- Check manifest.json is valid
- Verify service worker is registered

### Offline Not Working
- Check service worker registration
- Verify caching strategies
- Test in Chrome DevTools

### Icon Not Showing
- Verify icon path in manifest
- Check icon file exists
- Ensure proper MIME type

## Future Enhancements

- [ ] Push notifications
- [ ] Background sync
- [ ] App shortcuts
- [ ] Share API integration
- [ ] File system access
