#!/usr/bin/env node

const sigma = 0.794;
function rho(d)
{
  return Math.exp(-(d*d)/(sigma*sigma));
}

function is_diagdom(N,M)
{
  // check whether the matrix is diagonally dominant
  var i,j,k,l,d;
  var Aii, Aij, si;
  for (i=0; i<N; i++)
  {
    for (j=0; j<M; j++)
    {
      si = 0; // sum of the off-diagonal elements
      for (k=0; k<N; k++)
      {
        for (l=0; l<M; l++)
        {
          if ((i==k) && (j==l))
          {
            // diagonal element
            Aii = Math.abs(rho(0.0));
          }
          else
          {
            // off-diagonal element
            d = Math.sqrt((i-k)*(i-k)+(j-l)*(j-l));
            Aij = rho(d);
            si += Math.abs(Aij);
          }
        }
      }
      if (Aii <= si)
      {
        // break; row (i,j) is not diagonally dominant!
        return false;
      }
    }
  }
  return true;
}

function blur(O,B,N,M)
// O: "original image"
// B: "blurred image"
// N: height
// M: width
{
  var i,j,k,l;
  var ind_O, ind_B;
  var d;
  for(i=0; i<N; i++)
  {
    for(j=0; j<M; j++)
    {
      ind_B = M*i+j;
      B[ind_B] = 0.0;
      for(k=0; k<N; k++)
      {
        for(l=0; l<M; l++)
        {
          ind_O = M*k+l;
          d     = Math.sqrt((i-k)*(i-k)+(j-l)*(j-l));
          B[ind_B] += rho(d)*O[ind_O];
        }
      }
    }
  }
}

function jacobi(B,N,M,k_max)
{
  let n = N*M;
  let r = new Array(n);
  //let Ok1 = new Array(n);
  let k = 0, i=0;
  // initial guess
  //let Ok=[...B];
  let Ok = new Array(n);
  for (i=0;i<n;i++) Ok[i] = 0.0;

  let Aii = rho(0.0);

  for (k=0; k<k_max; k++)
  {
    blur(Ok,r,N,M);
    for (i=0; i<n; i++)
    {
      Ok[i] = Ok[i] + (B[i]-r[i])/Aii;
    }
  }
  return Ok;
}

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
let BLUR_ONLY = true;
let image_blurred = new Array(n);
let image_out = new Array(n);
if (BLUR_ONLY)
{
  blur(image_in,image_out,N,M);
}
else
{
  console.log("Diagonally dominant?", is_diagdom(N,M));
  blur(image_in,image_blurred,N,M);
  let k_max = 300;
  image_out=jacobi(image_blurred,N,M,k_max);
}

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
    i     = M*y+x;
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
