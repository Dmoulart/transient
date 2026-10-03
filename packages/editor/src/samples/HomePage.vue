<script setup lang="ts">
import Container from './Container.vue'
import Counter from './Counter.vue'
import Fragment from './Fragment.vue'

const cards = [
  {
    id: 1,
    title: 'Fast Delivery',
    description: 'Get your products in record time with our speedy delivery service.',
    icon: '🚀',
  },
  {
    id: 2,
    title: 'Best Quality',
    description: 'We guarantee high standards for all our products.',
    icon: '🏆',
  },
  {
    id: 3,
    title: 'Affordable Prices',
    description: 'Shop without breaking your budget.',
    icon: '💵',
  },
]
</script>

<template>
  <main class="p-12 max-w-5xl m-auto">
    <!-- Hero Section -->
    <!-- <section class="text-center py-16"> -->
    <h1 class="text-5xl font-semibold mb-6">
      Welcome to Our Store <Counter /> The clock is ticking
    </h1>
    <p class="text-gray-500 mb-10">
      We’re delighted you’re here! Explore our range of products, grab great deals, and enjoy a
      wonderful shopping experience.
    </p>
    <Container> Container ! </Container>
    <Fragment />

    <!-- </section> -->

    <!-- Cards Section -->
    <!-- <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="item in cards"
        :key="item.id"
        class="bg-gray-100 p-6 rounded-md shadow-md transform hover:shadow-lg hover:translate-y-[-5px] transition-all"
      >
        <div class="text-4xl mb-4">{{ item.icon }}</div>
        <h2 class="text-2xl font-semibold mb-2">
          {{ item.title }}
        </h2>
        <p>{{ item.description }}</p>
      </div>
    </section> -->

    <!-- Call to Action Section
    <section class="text-center mt-16">
      <h2 class="text-3xl font-semibold mb-4">Join Our Community</h2>
      <p class="text-gray-500 mb-6">
        Become a member today and enjoy exclusive offers and promotions.
      </p>
      <button
        class="bg-green-500 hover:bg-green-600 text-gray-50 font-semibold py-2 px-6 rounded-md shadow-md transform hover:translate-y-[-2px] transition-all"
      >
        Signup Now
      </button>
    </section>
    -->
  </main>
</template>

<style scoped></style>
