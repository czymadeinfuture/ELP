module Main exposing (main)

import Browser
import Html exposing (Html, text, button, div, input, label, span)
import Html.Attributes exposing (style, placeholder, type_, checked)
import Html.Events exposing (onClick, onInput, on, targetChecked)
import Json.Decode exposing (Decoder, string, list, field)
import Http
import Random

-- define model
type alias Model =
    { words : List String
    , selectedWord : Maybe String
    , definition : Maybe (List String)
    , loadingWords : Bool
    , userInput : String
    , feedback : String
    , showAnswer : Bool
    , gameStarted : Bool 
    }

-- initial model
initialModel : Model
initialModel =
    { words = []
    , selectedWord = Nothing
    , definition = Nothing
    , loadingWords = True
    , userInput = ""
    , feedback = ""
    , showAnswer = False
    , gameStarted = False 
    }


-- initial command
initLoadWordsCmd : Cmd Msg
initLoadWordsCmd =
    Http.get
        { url = "http://localhost:8000/words.txt"
        , expect = Http.expectString ReceiveWords
        }
        |> Cmd.map (\_ -> LoadWords)

-- type of message
type Msg
    = SelectRandomWord (List Int)
    | RequestRandomWord
    | ReceiveDefinition (Result Http.Error (List String))
    | LoadWords
    | ReceiveWords (Result Http.Error String)
    | UpdateUserInput String
    | ToggleShowAnswer Bool
    | StartGame


-- function to update model
update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
        RequestRandomWord ->
            if List.isEmpty model.words then
                ( model, Cmd.none )
            else
                ( model
                , Random.generate SelectRandomWord (Random.map List.singleton (Random.int 0 (List.length model.words - 1)))
                )

        SelectRandomWord indices ->
            let
                index = List.head indices |> Maybe.withDefault 0
                selected = List.drop index model.words |> List.head
                cmd = Maybe.map requestDefinition selected |> Maybe.withDefault Cmd.none
            in
            ( { model | selectedWord = selected, definition = Nothing, userInput = "", feedback = "" }
            , cmd
            )

        ReceiveDefinition result ->
            case result of
                Ok defs ->
                    ( { model | definition = Just defs }, Cmd.none )

                Err _ ->
                    ( { model | definition = Just ["Can't get the definition."], feedback = "Can't get the definition." }, Cmd.none )

        LoadWords ->
            ( { model | loadingWords = True }
            , Http.get
                { url = "http://localhost:8000/words.txt"
                , expect = Http.expectString ReceiveWords
                }
            )

        ReceiveWords result ->
            case result of
                Ok wordString ->
                    ( { model | words = String.words wordString, loadingWords = False }, Cmd.none )

                Err _ ->
                    ( { model | words = [], loadingWords = False }, Cmd.none )

        UpdateUserInput input ->
            let
                feedback = checkContent input model.selectedWord
                color = colorForMessage feedback
            in
            ( { model | userInput = input, feedback = feedback }, Cmd.none )

        ToggleShowAnswer toggle ->
            ( { model | showAnswer = toggle }, Cmd.none )

        StartGame ->
            ( { model | gameStarted = True }, Random.generate SelectRandomWord (Random.map List.singleton (Random.int 0 (List.length model.words - 1))) )
            

-- view
view : Model -> Html Msg
view model =
    div []
        [ div [ style "font-size" "36px", style "font-weight" "bold" ]
            [ if model.showAnswer && model.gameStarted then
                text <| Maybe.withDefault "Guess it!" model.selectedWord
              else
                text "Guess it!"
            ]
        , if model.gameStarted then
            button [ onClick RequestRandomWord, Html.Attributes.disabled model.loadingWords ] [ text "Get a new word to guess!" ]
          else
            button [ onClick StartGame ] [ text "Start the Game!" ]
        , if model.gameStarted then
            case model.definition of
                Just defs -> 
                    div [] 
                        (div [ style "font-size" "larger", style "font-weight" "bold" ] [ text "Meaning" ]
                         :: List.indexedMap (\index def -> 
                            div [ style "padding-left" "20px", style "font-size" "smaller" ] 
                                [ text (String.fromInt (index + 1) ++ ". " ++ def) ]) defs
                         ++ [ div [] [ text "" ] ]) 
                Nothing -> 
                    text ""
          else
            text ""
        , if model.gameStarted then
            div []
                [ div [] [ text "Type in to guess" ]
                , input [ placeholder "", onInput UpdateUserInput ] []
                , div [ style "color" (colorForMessage model.feedback) ] [ text model.feedback ]
                , div [] [ text "" ]
                , label []
                    [ input [ type_ "checkbox", on "change" checkboxDecoder, checked model.showAnswer ] []
                    , span [] [ text "show it" ]
                    ]
                ]
          else
            text ""
        , if model.loadingWords then
            div [] [ text "Loading..." ]
          else
            div [] []
        ]


-- JSON decoder for checkbox
checkboxDecoder : Decoder Msg
checkboxDecoder = Json.Decode.map ToggleShowAnswer targetChecked

-- check if content is correct
checkContent : String -> Maybe String -> String
checkContent content selectedWord =
    case selectedWord of
        Just word ->
            if content == word then
                "Yes"
            else
                if not (String.isEmpty content) && not (String.isEmpty word) && String.left 1 content == String.left 1 word then
                    "First letter is correct"
                else
                    "No"
        Nothing ->
            "No"

-- color for message (green for correct, red for wrong, blue for first letter correct)
colorForMessage : String -> String
colorForMessage message =
    case message of
        "Yes" ->
            "green"

        "First letter is correct" ->
            "blue"

        "No" ->
            "red"

        _ ->
            "black"  

-- send HTTP request to get definition
requestDefinition : String -> Cmd Msg
requestDefinition word =
    Http.get
        { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
        , expect = Http.expectJson ReceiveDefinition definitionDecoder
        }

-- JSON decoder for definition
definitionDecoder : Decoder (List String)
definitionDecoder =
    list (field "meanings" (list (field "definitions" (list (field "definition" string)))))
    |> Json.Decode.map (List.concatMap identity)
    |> Json.Decode.map (List.concatMap identity)



-- main program
main : Program () Model Msg
main =
    Browser.element
        { init = \_ -> (initialModel, initLoadWordsCmd)
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
