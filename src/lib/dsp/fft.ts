// src/lib/dsp/fft.ts

export class Complex {
  public re: number;
  public im: number;
  constructor(re: number, im: number) {
    this.re = re;
    this.im = im;
  }

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  magnitude(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }
}

/**
 * Radix-2 Cooley-Tukey Fast Fourier Transform (1D)
 * Note: Input array length MUST be a power of 2.
 */
export class FFT {
  public static transform(input: Complex[]): Complex[] {
    const N = input.length;
    if (N <= 1) return input;

    // Check if power of 2
    if ((N & (N - 1)) !== 0) {
      throw new Error('Input length must be a power of 2');
    }

    const even: Complex[] = [];
    const odd: Complex[] = [];
    for (let i = 0; i < N; i++) {
      if (i % 2 === 0) even.push(input[i]);
      else odd.push(input[i]);
    }

    const evenFft = this.transform(even);
    const oddFft = this.transform(odd);

    const out: Complex[] = new Array(N);
    for (let k = 0; k < N / 2; k++) {
      const angle = -2 * Math.PI * k / N;
      const t = new Complex(Math.cos(angle), Math.sin(angle)).mul(oddFft[k]);
      out[k] = evenFft[k].add(t);
      out[k + N / 2] = evenFft[k].sub(t);
    }

    return out;
  }

  /**
   * Helper to convert real numbers to magnitude spectrum
   */
  public static getMagnitudeSpectrum(realInput: number[]): number[] {
    const complexInput = realInput.map(val => new Complex(val, 0));
    const transformed = this.transform(complexInput);
    // Return only the first half (Nyquist limit)
    return transformed.slice(0, transformed.length / 2).map(c => c.magnitude());
  }
}
