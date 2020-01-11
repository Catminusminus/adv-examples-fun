# Adversarial Examples For Fun And Profit
Try to generate adversarial images for fun and profit. 

![screenshot](./resources/Screenshot.png)

## What is this
You can generate adversarial images in your browser by the power of tensorflow.js.

Demo: https://adv-examples-fun.netlify.com/

Attention! The above site is heavy. If you see a blank page, reload your browser.

## Attacks
Currently, you can try the below attaks.
- FGSM
- DeepFool

## Issues
Currently, the implementation of DeepFool attack is slightly modified from the original paper. This is because I found that the denominator of some formulas can be so small that the perturbation is too big. I am investigating this issue.

## Citations
FGSM is described by
```
@misc{goodfellow2014explaining,
    title={Explaining and Harnessing Adversarial Examples},
    author={Ian J. Goodfellow and Jonathon Shlens and Christian Szegedy},
    year={2014},
    eprint={1412.6572},
    archivePrefix={arXiv},
    primaryClass={stat.ML}
}.
```

DeepFool is described by
```
@misc{moosavidezfooli2015deepfool,
    title={DeepFool: a simple and accurate method to fool deep neural networks},
    author={Seyed-Mohsen Moosavi-Dezfooli and Alhussein Fawzi and Pascal Frossard},
    year={2015},
    eprint={1511.04599},
    archivePrefix={arXiv},
    primaryClass={cs.LG}
}
```

`src/utils/data.ts`, `src/utils/model.ts` and `src/sagas/index.ts` contain the modified version of the code from [TensorFlow.js Example: Training MNIST](https://github.com/tensorflow/tfjs-examples/tree/master/mnist). The license file is `LICENSE.original`.
## Author
Catminusminus
