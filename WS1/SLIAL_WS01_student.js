#!/usr/bin/env node

let fs = require("fs"),
   PNG = require("pngjs").PNG;

//let srcFname = process.argv[2],
//    dstFname = process.argv[3] || "out.png";

let srcFname = "cameraman_32x32.png";
let dstFname = "out.png";

//------------------------------------------------------------------------------
// Read the source PNG file
// Input:   png image file name, srcFname
// Output:  N,M: height and width of the image
//          n=NM
//          image_in: n-array with numbers in [0.0..1.0] repesenting grayscale values
//------------------------------------------------------------------------------
let data_in = fs.readFileSync(srcFname);
let png_in  = PNG.sync.read(data_in, {filterType: -1,});
// image size
let N = png_in.height;
let M = png_in.width;
let n = N*M;
let image_in = new Array(n);
var x,y,idx,i;
for (y=0; y<N; y++)
{
  for (x=0; x<M; x++)
  {
    i   = M*y+x;
    // we simply average r,g,b
    image_in[i] = (png_in.data[i*4+0]+png_in.data[i*4+1]+png_in.data[i*4+2])/(3.0*256);
  }
}


// do stuff with image_in
// here we simply put colors in a checkerboard pattern
image_out = new Array(n);
/*for (y=0; y<N; y++)
{
  for (x=0; x<M; x++)
  {
    i   = N*y+x;
    if ((x+y)%2) image_out[i]=20;
    else         image_out[i]=22;
  }
}*/


const sigma = 0.9;
function rho(d)
{
  return Math.exp(-(d*d)/(sigma*sigma));
}

function blur (O, B, M, N) {
  for (y=0; y<N; y++) {
    for (x=0; x<M; x++) {
      i = N*y+x;
      B[i] = 0.0;
      
      let k, l;
      for (k=0; k<N; k++) {
        for (l=0; l<M; l++) {
          let u = M*k+l;
          d = Math.sqrt((y-k)*(y-k)+(x-l)*(x-l));
          B[i] += rho(d)*O[u];
        }
      }
    }
  }
}

blur(image_in, image_out, M, N);

console.log(image_out);
//------------------------------------------------------------------------------
// Write the output PNG file
// Input:   png image file name, dstFname and array image_out representing
//          grayscale values
//          png_in datastructure as read above
//------------------------------------------------------------------------------

// compute the min amd max grayscale values for scaling:
let color_min  = Math.min(...image_out);
let color_max  = Math.max(...image_out);
let color_diff = Math.max(color_max-color_min,1.0E-10);
var color;
for (y=0; y<N; y++)
{
  for (x=0; x<M; x++)
  {
    i     = N*y+x;
    // scale the color to [0..255] range
    color = Math.round(255*(image_out[i]-color_min)/color_diff);
    png_in.data[i*4+0] = color;
    png_in.data[i*4+1] = color;
    png_in.data[i*4+2] = color;
    png_in.data[i*4+3] = 255;
  }
}
// Write everything into a file
let buff = PNG.sync.write(png_in);
fs.writeFileSync(dstFname, buff);
