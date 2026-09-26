# Islands

```html
<Editor>
    <Canvas>
       <Renderer component="Hero.vue">
            <h1 data-tst-id>Top Level H1 of my component</h1>
            <p  data-tst-id>Small Description</p>

            <Container data-tst-id>
                <template default>
                    <div data-tst-current-text-edition contentEditable="true"/>
                    <div other component/>

                </template>
            </Container>
       </Renderer>
    </Canvas>
</Editor>
```