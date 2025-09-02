# Clerk Authentication Setup Guide

## 🚀 Quick Setup

### 1. Create Clerk Account
1. Go to [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Sign up for a free account
3. Create a new application

### 2. Get Your Publishable Key
1. In your Clerk dashboard, go to "API Keys"
2. Copy your **Publishable Key** (starts with `pk_test_`)

### 3. Set Up Environment Variables
Create a `.env` file in your project root:

```bash
# .env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

**Important:** Replace `pk_test_your_actual_key_here` with your actual publishable key from Clerk dashboard.

### 4. Configure Clerk Application
In your Clerk dashboard:

1. **Configure Sign-in/Sign-up URLs:**
   - Sign-in URL: `http://localhost:3000`
   - Sign-up URL: `http://localhost:3000`
   - After sign-in URL: `http://localhost:3000`
   - After sign-up URL: `http://localhost:3000`

2. **Configure OAuth Providers (Optional):**
   - Go to "User & Authentication" → "Social Connections"
   - Enable Google, GitHub, etc.

### 5. Test the Integration
1. Start your development server: `npm run dev`
2. Click "Get started" button in the header
3. Test sign-in/sign-up flow

## 🎯 Features Implemented

- ✅ **ClerkProvider** wrapping the entire app
- ✅ **SignInButton** with modal mode
- ✅ **UserButton** for authenticated users
- ✅ **Responsive design** for mobile and desktop
- ✅ **Smooth integration** with existing UI

## 🔧 Customization

### UserButton Appearance
The UserButton is styled to match your design:
```jsx
<UserButton 
  afterSignOutUrl="/"
  appearance={{
    elements: {
      avatarBox: "w-8 h-8"
    }
  }}
/>
```

### SignInButton Modal
The SignInButton opens in a modal for better UX:
```jsx
<SignInButton mode="modal">
  <button>Get started</button>
</SignInButton>
```

## 🚨 Troubleshooting

### "Missing Publishable Key" Error
- Make sure your `.env` file exists in the project root
- Verify the key starts with `pk_test_` or `pk_live_`
- Restart your development server after adding the key

### Authentication Not Working
- Check your Clerk dashboard configuration
- Verify the URLs match your development server
- Check browser console for any errors

## 📚 Next Steps

1. **Add Protected Routes**: Protect certain pages for authenticated users only
2. **User Profile**: Add user profile management
3. **Role-based Access**: Implement different user roles
4. **Webhooks**: Set up webhooks for user events

## 🔗 Useful Links

- [Clerk Documentation](https://clerk.com/docs)
- [React Integration Guide](https://clerk.com/docs/quickstarts/react)
- [Clerk Dashboard](https://dashboard.clerk.com/)
