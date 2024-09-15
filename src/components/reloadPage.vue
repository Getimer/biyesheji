<template>
   

    <div class="nullpage">
    <div class="multi-spinner-container">
      <div class="multi-spinner">
        <div class="multi-spinner">
          <div class="multi-spinner">
            <div class="multi-spinner">
              <div class="multi-spinner">
                <div class="multi-spinner">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>



</script>
<style lang="scss" scoped>
.nullpage {
    background: rgb(227, 212, 191);
    background: linear-gradient(142deg, rgba(227, 212, 191, 1) 0%, rgba(243, 232, 216, 1) 100%);
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

    width: 100%;
    height: 100%;
}
.multi-spinner-container {
   
    width: 200px;
    height: 200px;
  position: relative;

  margin: auto;
  
  overflow: hidden;
}

.multi-spinner {
  position: absolute;
  width: calc(100% - 9.9px);
  height: calc(100% - 9.9px);
  border: 5px solid transparent;
border-top-color: #eb572a;
// border-image: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);
  border-radius: 50%;
  animation: spin 5s cubic-bezier(0.17, 0.49, 0.96, 0.76) infinite;
}

@keyframes gradient {
                0% {
                    background-position: 0 12%;
                }

                50% {
                    background-position: 100% 100%;
                }

                100% {
                    background-position: 0 12%;
                }
            }


@keyframes spin {
  from {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>