module Main exposing (main)

import Browser
import Html exposing (Html, text, button, div)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick)
import Json.Decode exposing (Decoder, string, list, field)
import Http
import Random

-- 模型定义
type alias Model =
    { words : List String
    , selectedWord : Maybe String
    , definition : Maybe (List String)
    , loadingWords : Bool
    }

-- 初始模型
initialModel : Model
initialModel =
    { words = []
    , selectedWord = Nothing
    , definition = Nothing
    , loadingWords = True
    }

initLoadWordsCmd : Cmd Msg
initLoadWordsCmd =
    Http.get
        { url = "http://localhost:8000/words.txt"
        , expect = Http.expectString ReceiveWords
        }
        |> Cmd.map (\_ -> LoadWords)

-- 消息类型
type Msg
    = SelectRandomWord (List Int)
    | RequestRandomWord
    | ReceiveDefinition (Result Http.Error (List String))
    | LoadWords
    | ReceiveWords (Result Http.Error String)

-- 更新函数
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
            ( { model | selectedWord = selected, definition = Nothing }
            , cmd
            )

        ReceiveDefinition result ->
            case result of
                Ok defs ->
                    ( { model | definition = Just defs }, Cmd.none )

                Err _ ->
                    ( { model | definition = Just ["无法获取定义。"] }, Cmd.none )

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

-- 视图函数
view : Model -> Html Msg
view model =
    div []
        [ button [ onClick RequestRandomWord, Html.Attributes.disabled model.loadingWords ] [ text "选择一个词" ]
        , div [] [ text <| Maybe.withDefault "没有选择" model.selectedWord ]
        , case model.definition of
            Just defs -> 
                div [] 
                    (div [ style "font-size" "larger", style "font-weight" "bold" ] [ text "Definition" ]
                     :: List.indexedMap (\index def -> 
                        div [ style "padding-left" "20px", style "font-size" "smaller" ] 
                            [ text (String.fromInt (index + 1) ++ ". " ++ def) ]) defs)
            Nothing -> 
                div [] [ text "" ]
        , if model.loadingWords then
            div [] [ text "正在加载单词..." ]
          else
            div [] []
        ]

-- 发送 HTTP 请求获取定义
requestDefinition : String -> Cmd Msg
requestDefinition word =
    Http.get
        { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
        , expect = Http.expectJson ReceiveDefinition definitionDecoder
        }

definitionDecoder : Decoder (List String)
definitionDecoder =
    list (field "meanings" (list (field "definitions" (list (field "definition" string)))))
    |> Json.Decode.map (List.concatMap identity)
    |> Json.Decode.map (List.concatMap identity)


main : Program () Model Msg
main =
    Browser.element
        { init = \_ -> (initialModel, initLoadWordsCmd)
        , update = update
        , view = view
        , subscriptions = \_ -> Sub.none
        }
