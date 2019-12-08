---
layout: posts
title:  "Creating word clouds with python"
date:   2019-07-31 09:00:00 +0100
categories: [promoted, article, featured]
tags: [python, data visualisation]
backgroundurl: https://miro.medium.com/max/1600/1*bMt1xhiVw9HEyFy-6ODNSQ.jpeg
time: 7 min
---

During a recent NLP project, I came across an [article where word clouds were created in the shape of US Presidents using words from their inauguration speeches](http://keyonvafa.com/inauguration-wordclouds/). Whilst I had used word clouds to visualise the most frequent words in a document, I’d not considered using this with a mask to represent the topic or subject. This got me thinking...
<br><br>
Several months ago, shortly before the final series of Game Of Thrones and after having just rewatched seasons 1–7, I was eagerly awaiting the finale — so much so that I went looking for any Game Of Thrones data I could find online to create a predictor for who would survive the chaos of season 8 and what would happen within the 7 Kingdoms. Unfortunately, I was out of time but I did find plenty of [data](https://www.reddit.com/r/datasets/comments/769nhw/game_of_thrones_datasets_xpost_from_rfreefolk/) and visualisations that people had put together. When I came across the inaugural word clouds I wondered if I could use this Game Of Thrones data, particularly scripts, with image masks of the characters to create some pretty cool visualisations. In this article, as [presented](https://github.com/kaparker/gameofthrones-wordclouds/blob/master/WordClouds_CodeUPXTechNomads_240719.pdf) at a recent tech meet-up, I will walk through my steps to create Game Of Thrones word clouds using python.

# Getting Started

Following a similar method to the inaugural word cloud article, there are several steps involved when dealing with text based data. The steps are:

1. Finding relevant data

2. Cleaning data

3. Creating a mask from the image

4. Generating word clouds

Since I will be using python in this tutorial, there are many libraries to help with the above steps, also [Dipanjan Sarkar’s guide to Natural Language Processing](https://towardsdatascience.com/a-practitioners-guide-to-natural-language-processing-part-i-processing-understanding-text-9f4abfd13e72) provides a comprehensive introduction to techniques in text analytics if you are looking for further reading around the topic.

Before getting started with the first step, I defined the goal of the project to ensure that no important steps were missed and to have a clear vision of the target.
<br><br>
**Project goal:** To create word clouds for Game Of Thrones characters masked with an image.
<br><br>
# 1. Finding relevant data

There is plenty of Game Of Thrones data available online — [GitHub](https://github.com) and [Kaggle](https://kaggle.com) are where I usually first search for datasets — and I quickly found a dataset containing the [scripts](https://github.com/shekharkoirala/Game_of_Thrones/tree/master/Data).
<br><br>
To achieve the project goal, the lines for each character need to be stated —the first question was: are the character lines are available?

![Snippet of Game of Thrones script](https://cdn-images-1.medium.com/max/2000/1*mIC-irxn5-rFaD9qwsQZ2w.png)*Snippet of Game of Thrones script*
<br><br>
Looking at a snippet from the first episode, the character data is available! However, when exploring further episodes and season, the format for character names varies.
<br><br>
In the case above only the character’s first name is used and this is all in uppercase, whilst in other seasons the characters full name is used with letter case. Stage directions can also be included within the character name.
<br><br>
The search for all lines by the character name, a regular expressions with the character names can be used:

    re.findall(r'(^'+name+r'.*:.*)', line, re.IGNORECASE)

This expression searches for the start of a line (^), followed by the character name which we input as a variable, followed by any text (.*), then a colon to indicate that this is a character’s line (:) and followed by any text (.*). By containing this regular expression within brackets, the full line is returned. Finally, the case is ignored, so the character name can be upper/lower/letter case.
<br><br>
Using the function below will return all the lines for a character:

    # final_data taken from:  
    # [https://github.com/shekharkoirala/Game_of_Thrones](https://github.com/shekharkoirala/Game_of_Thrones)

    # get data for characters
    def get_char_lines(char):    
        output = []          
        print('Getting lines for', char)        
    
        with open('final_data.txt', 'r') as f:
            for line in f:
                if re.findall(r'(^'+char+r'.*:.*)',line,re.IGNORECASE):
                    output.append(line)
        f.close()
        print(char, 'has ', len(output), 'lines')

    return output

    # get lines using
    get_char_lines('arya')

# 2. Cleaning data

Now that we have the lines for a character, these need to be cleaned.

The following techniques are used for cleaning the lines, these same techniques are also outlined in detail in the [NLP Guide](https://towardsdatascience.com/a-practitioners-guide-to-natural-language-processing-part-i-processing-understanding-text-9f4abfd13e72) referenced above. Again regular expressions are useful here to replace or remove characters:

* Remove line info eg. JON:
```
    re.sub(r'.*:', '', text)
```
* Remove brackets — remove any stage directions from the character lines
```
    re.sub('[\(\[].*?[\)\]]', ' ', text)
```
* Remove accented characters and normalise using the unicodedata library
```
    unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8', 'ignore')
```
* Expand any contracted words eg. don’t → do not
There is a python library for this, copy contractions.py to your working directory from:
[https://github.com/dipanjanS/practical-machine-learning-with-python/](https://github.com/dipanjanS/practical-machine-learning-with-python/blob/master/bonus%20content/nlp%20proven%20approach/contractions.py)

* (Optional): apply lemmatisation where a word is stemmed to a root word that is in the dictionary, eg. is, are → be 
Not currently using lemmatisation as it doesn’t handle some words well eg. Stannis → Stanni

* Convert all text to lowercase
```
    text.lower()
```
* Remove special characters (*,.!?) with the option to remove numbers too — default is set to false
```
    pattern = r'[^a-zA-Z0-9\s]' if not remove_digits else r'[^a-zA-Z\s]'    re.sub(pattern, '', text)
```
* Remove stop words, using stop words from the nltk library by first tokenising the text, splitting the string into a list of substrings and then removing any stop words
```
    stopword_list = stopwords.words('english')    
    tokens = nltk.word_tokenize(text)    
    tokens = [token.strip() for token in tokens]    
    ' '.join([token for token in tokens if token not in stopword_list])
```
These cleaning techniques have been based on several different sources and there are many variations of these steps as well as additional cleaning techniques that can be used. These initial cleaning steps have been used in this [project](https://github.com/kaparker/gameofthrones-wordclouds/blob/master/gotwordcloud.py).

# 3. Create a mask from image

Based on the inauguration word clouds, the PIL library is used to open the image, a numpy array is created from the image to create a mask.
```
    char_mask = np.array(Image.open("images/image.jpeg"))    
    image_colors = ImageColorGenerator(char_mask)
```
Optionally the numpy array can be used with wordcloud.ImageColorGenerator to then recolor the word cloud to represent the colours from the image, or otherwise. This will be covered in the next section.
<br><br>
After initially testing an image as a word cloud mask, the background in the image created too much noise that the shape of the character was not well defined. To avoid this, it can be useful to remove the image background and replace with a white background instead.

![Remove background from image and replace with white background](https://cdn-images-1.medium.com/max/2000/1*yKQxyCc5v8ifMOz_KsmfKA.png)*Remove background from image and replace with white background*

# 4. Generate word clouds

The final step is to create the word cloud using the generate() function.
```
    wc = WordCloud(background_color="white", max_words=200, width=400, height=400, mask=char_mask, random_state=1).generate(text)

    # to recolour the image
    plt.imshow(wc.recolor(color_func=image_colors))
```
The word cloud will be masked with an image and the size of text will be based on word frequency.
<br><br>
The parameters of the word cloud can be adjusted — try increasingmax_words to see some of the less frequent words included, note that this should be less than the number of unique words within your document.
<br><br>
As mentioned in the previous section, the recolor step is optional and here is used to represent the original image colours.

## Game of Thrones Word clouds

Using the steps above with images of Game Of Thrones characters, the generated words clouds are presented below:

### **Arya**

![Arya word cloud](https://cdn-images-1.medium.com/max/8000/1*hmp_uwkdfW2EO-mLOosf5Q.png)*Arya word cloud*

### **Jon Snow**

![Jon Snow word cloud](https://cdn-images-1.medium.com/max/8000/1*liuB_vfT8yHGeMNnEFOr2A.png)*Jon Snow word cloud*

### **Daenerys**

![Daenerys word cloud](https://cdn-images-1.medium.com/max/8000/1*jQefoqmu6zpswXLDoWo3Qg.png)*Daenerys word cloud*

### **Ser Davos**

![Ser Davos word cloud](https://cdn-images-1.medium.com/max/8000/1*-NjYPnJMwLii4aBPwVO4Qg.png)*Ser Davos word cloud*
<br><br>
This has also been extended to generate word clouds based on Houses:

### **House Lannister**

![Lannister word cloud](https://cdn-images-1.medium.com/max/8000/1*02ESF7ucOaIEfRSiSIvn3g.png)*Lannister word cloud*

### **House Stark**

![Stark word cloud](https://cdn-images-1.medium.com/max/8000/1*L5PxjLDHy0Gb9gSXp1-2Ug.png)*Stark word cloud*
<br><br>
With these word clouds the initial project goal has been reached!

# Improvements

There are several ways in which these word clouds can be improved.

* **Common words:** There are recurring words that are common in all the characters scripts. Currently the word clouds are generated based on the word frequency however, an alternative would be TFIDF which weights the terms based on the term frequency in the document and the frequency with respect to the corpus. Alternatively, a custom stop word list could be generated to remove other frequent words

* **Lemmatisation/stemming**: Lemmatisation has not been used in the examples above as some words unique to Game of Thrones were shortened when testing (Stannis → Stanni), however this does mean that words which come from the same root word are not linked and occur several times in the word cloud eg. say, said. An alternative lemmatisation method or stemming technique could be used.

* **Text cleaning:** There are further cleaning or data preparation steps that could be used

* **Word cloud features:** I have tested with different word colours, background colours and word cloud parameters, the grey colour and black background works in this case but some of the parameters could be further optimised

* **Further text analysis:** many insights can be drawn from this dataset. Much more scope for analysis!

# Extension — Stranger Things

Looking into further shows, I eventually found [Stranger Things script](https://www.springfieldspringfield.co.uk/episode_scripts.php?tv-show=stranger-things-2016) — although they are missing character lines the data can still be used to [generate word clouds](https://github.com/kaparker/stranger-things)….

![Stranger Things word cloud](https://cdn-images-1.medium.com/max/8000/1*5BhesvlDaBTXKqq37k3qhQ.png)*Stranger Things word cloud*

# Summary

In this article I have walked through the basic steps to generate word clouds which are masked with an image.
<br><br>
This is just the start of my experimenting with word clouds! There is a huge scope for further development and improvement in the project, I hope you can follow the steps to create your own projects with word clouds!
<br><br>
This article was originally published on [Medium](https://towardsdatascience.com/creating-word-clouds-with-python-f2077c8de5cc?source=friends_link&sk=d40a8142f204b2900a4dbbd1edd73c3e).