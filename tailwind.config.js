module.exports = {
    future: { // for tailwind 2.0 compat
      purgeLayersByDefault: true, 
      removeDeprecatedGapUtilities: true,
    },
    plugins: [
      // for tailwind UI users only
      require('@tailwindcss/ui'),
      // other plugins here
    ],
    purge: {
      content: [
        "./src/**/*.svelte",
        // may also want to include base index.html
      ], 
      enabled: false
    },
  };