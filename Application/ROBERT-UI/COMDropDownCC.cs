using System.Collections;
using System.Windows;
using System.Windows.Controls;

namespace ROBERT_UI
{
    public class COMDropDownCC : Control
    {
        static COMDropDownCC()
        {
            DefaultStyleKeyProperty.OverrideMetadata(typeof(COMDropDownCC), new FrameworkPropertyMetadata(typeof(COMDropDownCC)));
        }

        // ItemsSource DependencyProperty
        public static readonly DependencyProperty ItemsSourceProperty =
            DependencyProperty.Register("ItemsSource", typeof(IEnumerable), typeof(COMDropDownCC), new PropertyMetadata(null));

        public IEnumerable ItemsSource
        {
            get { return (IEnumerable)GetValue(ItemsSourceProperty); }
            set { SetValue(ItemsSourceProperty, value); }
        }
    }
}
