<template>
  <section class="section">
    <h1>
      <slot name="header" />
    </h1>
    <div>
      <slot />
    </div>
    <footer><slot name="footer" /></footer>
  </section>
</template>
