<template>
  <UButton
    variant="solid"
    size="lg"
    icon="mynaui:chevron-up"
    class="fixed bottom-4 right-4 z-50 bg-primary text-white rounded-full cursor-pointer transition-all duration-300"
    :class="{ hidden: !scrollToTopStatus }"
    @click="scrollToTop"
  />
</template>
<script setup lang="ts">
  const scrollToTopStatus = ref(false);
  watch(scrollToTopStatus, newVal => {
    console.log('scrollToTopStatus', newVal);
  });
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (window.scrollY > 100) {
      scrollToTopStatus.value = true;
    } else {
      scrollToTopStatus.value = false;
    }
  };
  onMounted(() => {
    console.log('onMounted');
    window.addEventListener('scroll', () => {
      handleScroll();
    });
  });
  onUnmounted(() => {
    window.removeEventListener('scroll', () => {
      handleScroll();
    });
  });
</script>
