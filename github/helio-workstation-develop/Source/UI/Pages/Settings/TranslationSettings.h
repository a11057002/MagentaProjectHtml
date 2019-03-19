/*
    This file is part of Helio Workstation.

    Helio is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Helio is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Helio. If not, see <http://www.gnu.org/licenses/>.
*/

#pragma once

//[Headers]
#include "Translation.h"
//[/Headers]

#include "../../Themes/SeparatorHorizontal.h"

class TranslationSettings final : public Component,
                                  public ListBoxModel,
                                  private ChangeListener,
                                  public Button::Listener
{
public:

    TranslationSettings();
    ~TranslationSettings();

    //[UserMethods]

    //===------------------------------------------------------------------===//
    // ListBoxModel
    //===------------------------------------------------------------------===//

    int getNumRows() override;
    Component *refreshComponentForRow(int, bool, Component *) override;
    void paintListBoxItem(int, Graphics &, int, int, bool) override {}

    //[/UserMethods]

    void paint (Graphics& g) override;
    void resized() override;
    void buttonClicked(Button* buttonThatWasClicked) override;


private:

    //[UserVariables]

    //===------------------------------------------------------------------===//
    // ChangeListener
    //===------------------------------------------------------------------===//

    void changeListenerCallback(ChangeBroadcaster *source) override;
    void scrollToSelectedLocale();

    Array<Translation::Ptr> availableTranslations;
    Translation::Ptr currentTranslation;

    //[/UserVariables]

    UniquePointer<ListBox> translationsList;
    UniquePointer<TextButton> helpButton;
    UniquePointer<SeparatorHorizontal> shadow;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (TranslationSettings)
};
