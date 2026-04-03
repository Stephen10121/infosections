<div class="absolute top-0 left-0 w-full h-1">
    <div class="progress-bar-indicator"></div>
</div>

<style>
    .progress-bar-indicator {
  height: 100%;
  width: 100%;
   /* this will do the magic */
  -webkit-mask:linear-gradient(#fff 0 0);
          mask:linear-gradient(#fff 0 0);
}
.progress-bar-indicator::before {
  content:"";
  position:absolute;
  top:0;
  left:0;
  right:0;
  bottom:0;
  background-image: linear-gradient(to right, red, blue); /* your gradient here */
}
</style>